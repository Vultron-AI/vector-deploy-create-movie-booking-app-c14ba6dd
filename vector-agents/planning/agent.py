#!/usr/bin/env python3
"""
Planning Agent - Creates implementation plan using Claude Agent SDK.

Usage:
    python3 agent.py --model claude-opus-4-5 --mode new
    python3 agent.py --model claude-opus-4-5 --mode edit --edit-request "Add dark mode"
    python3 agent.py --model claude-opus-4-5 --mode new --image-paths ".claude/user_requests/img1.png"
"""

import argparse
import asyncio
import sys
from enum import StrEnum

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
    AssistantMessage,
    ClaudeAgentOptions,
    ResultMessage,
    SystemMessage,
    query,
)
from planning.prompts import build_edit_planning_prompt, build_prompt


class PlanningMode(StrEnum):
    """Planning modes."""

    NEW = "new"
    EDIT = "edit"


async def run_planning(
    model: str,
    mode: str,
    edit_request: str | None = None,
    image_paths: list[str] | None = None,
) -> None:
    """Run planning agent."""
    # Build prompt using imported prompt functions
    if mode == PlanningMode.EDIT:
        full_prompt = build_edit_planning_prompt(edit_request=edit_request)
    else:
        full_prompt = build_prompt()

    # Append image references to prompt if provided
    if image_paths:
        image_refs = "\n".join([f"- {path}" for path in image_paths])
        full_prompt = f"{full_prompt}\n\n## User-Provided Reference Images\n\nIMPORTANT: The user has attached reference images. You MUST read these image files to understand what they want:\n\n{image_refs}\n\nPlease use the Read tool to view each image file listed above. These images show the visual design, layout, or functionality the user wants to achieve. Incorporate what you see in the images into your plan."

    options = ClaudeAgentOptions(
        model=model,
        system_prompt={"type": "preset", "preset": "claude_code"},
        cwd="/home/user",
        permission_mode="bypassPermissions",  # SECURITY: see VEC-351 rationale in agent_types.py
        setting_sources=["project", "user"],  # Loads CLAUDE.md from .claude/ and ~/.claude/
        allowed_tools=["Read", "Write", "Edit", "Glob", "Grep", "Bash"],
        max_buffer_size=MAX_BUFFER_SIZE,
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
    parser = argparse.ArgumentParser(description="Planning Agent")
    parser.add_argument("--model", required=True, choices=[m.value for m in ClaudeSDKModel])
    parser.add_argument("--mode", required=True, choices=[m.value for m in PlanningMode])
    parser.add_argument("--edit-request", help="Edit request (required for edit mode)")
    parser.add_argument("--image-paths", help="Comma-separated list of image paths in sandbox")
    args = parser.parse_args()

    if args.mode == PlanningMode.EDIT and not args.edit_request:
        emit_error("--edit-request required for edit mode")
        sys.exit(1)

    # Parse image paths from comma-separated string
    image_paths = None
    if args.image_paths:
        image_paths = [p.strip() for p in args.image_paths.split(",") if p.strip()]

    log_stderr(
        f"Planning agent starting: model={args.model}, mode={args.mode}, images={len(image_paths) if image_paths else 0}"
    )
    asyncio.run(
        run_planning(
            model=args.model,
            mode=args.mode,
            edit_request=args.edit_request,
            image_paths=image_paths,
        )
    )


if __name__ == "__main__":
    main()

