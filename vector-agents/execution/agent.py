#!/usr/bin/env python3
"""
Execution Agent - Executes plan and generates code using Claude Agent SDK.

For CREATE jobs, the following files are pre-injected by the backend:
- /home/user/project/artifacts/design-style-guide.md
- /home/user/frontend/src/styles/tokens.css

Usage:
    # Normal execution with Plan.md
    python3 agent.py --model claude-opus-4-5

    # With explicit plan path
    python3 agent.py --model claude-opus-4-5 --plan-path artifacts/Plan.md

    # Planning skipped (edit without plan) - requires edit-request
    python3 agent.py --model claude-opus-4-5 --plan-path none --edit-request "Add dark mode"

    # With reference images
    python3 agent.py --model claude-opus-4-5 --image-paths ".claude/user_requests/img1.png,.claude/user_requests/img2.png"
"""

import argparse
import asyncio
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, "/home/user/.vector-agents")

from agent_types import ClaudeSDKModel
from base import (
    MAX_BUFFER_SIZE,
    emit_error,
    emit_event,
    log_stderr,
    message_to_dict,
    result_usage_to_dict,
)
from claude_agent_sdk import (
    AgentDefinition,
    AssistantMessage,
    ClaudeAgentOptions,
    ResultMessage,
    SystemMessage,
    query,
)
from execution.prompts import build_prompt as build_execution_prompt

# =============================================================================
# SUBAGENT DEFINITIONS (NOT HOOKED UP - for future use)
# =============================================================================

SUBAGENT_DEFINITIONS = {
    "code-reviewer": AgentDefinition(
        description="Reviews code for best practices",
        prompt="You are a code reviewer...",
        tools=["Read", "Grep"],
        model="sonnet",
    ),
    "test-writer": AgentDefinition(
        description="Writes comprehensive tests",
        prompt="You are a testing expert...",
        tools=["Read", "Write", "Bash"],
        model="sonnet",
    ),
}


async def run_execution(
    model: str,
    plan_path: str | None = "artifacts/Plan.md",
    edit_request: str | None = None,
    image_paths: list[str] | None = None,
    skip_validation: bool = False,
) -> None:
    """Run execution agent with full streaming.

    Args:
        model: Claude model to use.
        plan_path: Path to Plan.md, or None if planning was skipped.
        edit_request: User's edit request (required when plan_path is None).
        image_paths: Optional list of reference image paths in sandbox.
    """
    # Build prompt using imported prompt function
    # Supports both normal execution (with plan) and planning-skipped (no plan, edit request)
    full_prompt = build_execution_prompt(
        plan_path=plan_path,
        edit_request=edit_request,
        skip_validation=skip_validation,
    )

    # Append image references to prompt if provided
    if image_paths:
        image_refs = "\n".join([f"- {path}" for path in image_paths])
        full_prompt = f"{full_prompt}\n\n## User-Provided Reference Images\n\nThe user has attached the following reference images:\n\n{image_refs}"

    # Verify CLAUDE.md exists before starting (sanity check)
    claude_md = "/home/user/.claude/CLAUDE.md"
    if os.path.exists(claude_md):
        log_stderr(f"CLAUDE.md found at {claude_md} ({os.path.getsize(claude_md)} bytes)")
    else:
        log_stderr(f"WARNING: CLAUDE.md not found at {claude_md}")

    options = ClaudeAgentOptions(
        model=model,
        system_prompt={"type": "preset", "preset": "claude_code"},
        cwd="/home/user",
        permission_mode="bypassPermissions",  # SECURITY: see VEC-351 rationale in agent_types.py
        setting_sources=["project", "user"],  # Loads CLAUDE.md from .claude/ and ~/.claude/
        enable_file_checkpointing=True,
        allowed_tools=["Read", "Write", "Edit", "Glob", "Grep", "Bash", "TodoWrite", "Skill", "Agent"],
        plugins=[
            {"type": "local", "path": "/home/user/.vector-plugins/frontend-design"},
            {"type": "local", "path": "/home/user/.vector-plugins/feature-dev"},
        ],
        max_buffer_size=MAX_BUFFER_SIZE,
        # agents=SUBAGENT_DEFINITIONS,  # TODO: Enable when ready
    )

    try:
        async for message in query(prompt=full_prompt, options=options):
            if isinstance(message, SystemMessage):
                if hasattr(message, "subtype") and message.subtype == "init":
                    data = getattr(message, "data", {})
                    session_id = data.get("session_id")
                    emit_event("init", {"data": {"session_id": session_id}})
                else:
                    emit_event("system", {"message": str(message)})

            elif isinstance(message, AssistantMessage):
                # Emit full message - SDKStreamMapper decomposes content blocks
                emit_event("assistant", {"message": message_to_dict(message)})

            elif isinstance(message, ResultMessage):
                # Use result_usage_to_dict to get authoritative usage from modelUsage
                # per Claude Agent SDK docs on cost tracking
                emit_event("result", result_usage_to_dict(message))

    except Exception as e:
        emit_error(str(e), {"exception_type": type(e).__name__})
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Execution Agent")
    parser.add_argument("--model", required=True, choices=[m.value for m in ClaudeSDKModel])
    parser.add_argument(
        "--plan-path",
        default="artifacts/Plan.md",
        help="Path to Plan.md (use 'none' if planning was skipped)",
    )
    parser.add_argument(
        "--edit-request", help="User's edit request (required when --plan-path is 'none')"
    )
    parser.add_argument("--image-paths", help="Comma-separated list of image paths in sandbox")
    parser.add_argument(
        "--skip-validation", action="store_true", help="Skip validation steps for tiny/small tasks"
    )
    args = parser.parse_args()

    # Handle plan_path: "none" string means planning was skipped
    plan_path = None if args.plan_path.lower() == "none" else args.plan_path

    # Validate: edit_request is required when plan_path is None
    if plan_path is None and not args.edit_request:
        emit_error("--edit-request is required when --plan-path is 'none'")
        sys.exit(1)

    # Parse image paths from comma-separated string
    image_paths = None
    if args.image_paths:
        image_paths = [p.strip() for p in args.image_paths.split(",") if p.strip()]

    log_stderr(
        f"Execution agent starting: model={args.model}, plan_path={plan_path}, images={len(image_paths) if image_paths else 0}, skip_validation={args.skip_validation}"
    )
    asyncio.run(
        run_execution(
            model=args.model,
            plan_path=plan_path,
            edit_request=args.edit_request,
            image_paths=image_paths,
            skip_validation=args.skip_validation,
        )
    )


if __name__ == "__main__":
    main()

