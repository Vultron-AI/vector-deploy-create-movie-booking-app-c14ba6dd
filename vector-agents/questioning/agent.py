#!/usr/bin/env python3
"""
Questioning Agent - Multi-turn requirements gathering using Claude Agent SDK.

Uses SDK's stateful conversation handling:
- system_prompt set via ClaudeAgentOptions (not embedded in prompt)
- Session resume via ClaudeAgentOptions.resume
- Different prompts based on mode: first_turn, continue, fallback

Usage:
    # First turn
    python3 agent.py --mode first_turn --model claude-sonnet-4-5 --initial-request "Build a task app"

    # Continue (with session resume)
    python3 agent.py --mode continue --model claude-sonnet-4-5 --session-id "abc123" \
        --user-response "Option B - I want it for small teams" --round 2

    # Fallback (session lost, rebuild from history)
    python3 agent.py --mode fallback --model claude-sonnet-4-5 --initial-request "Build a task app" \
        --chat-history '[{"role": "user", "content": "..."}, ...]'
"""

import argparse
import asyncio
import json
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
from questioning.prompts import (
    MAX_ROUNDS,
    SYSTEM_PROMPT,
    build_continue_prompt,
    build_fallback_prompt,
    build_first_turn_prompt,
)
from questioning.schemas import get_question_schema


class QuestioningMode(StrEnum):
    """Questioning agent modes."""

    FIRST_TURN = "first_turn"
    CONTINUE = "continue"
    FALLBACK = "fallback"


async def run_questioning(
    mode: str,
    model: str,
    initial_request: str | None = None,
    user_response: str | None = None,
    chat_history: list[dict] | None = None,
    session_id: str | None = None,
    round_number: int = 1,
) -> None:
    """
    Run questioning phase with mode-based prompt handling.

    Args:
        mode: "first_turn", "continue", or "fallback"
        model: Claude model to use
        initial_request: User's initial app request (required for first_turn/fallback)
        user_response: User's response to previous question (required for continue)
        chat_history: Full chat history (required for fallback)
        session_id: SDK session ID (required for continue)
        round_number: Current round number (for continue mode)
    """
    # Build prompt based on mode
    if mode == QuestioningMode.FIRST_TURN:
        prompt = build_first_turn_prompt(initial_request)
        log_stderr(f"First turn: initial_request={initial_request[:50]}...")

    elif mode == QuestioningMode.CONTINUE:
        prompt = build_continue_prompt(user_response, round_number)
        log_stderr(f"Continue: session_id={session_id}, round={round_number}")

    elif mode == QuestioningMode.FALLBACK:
        prompt = build_fallback_prompt(chat_history or [], initial_request)
        log_stderr(f"Fallback: rebuilding from {len(chat_history or [])} messages")

    else:
        emit_error(f"Unknown mode: {mode}")
        sys.exit(1)

    # Build options with system_prompt set via options (not in prompt)
    options = ClaudeAgentOptions(
        model=model,
        system_prompt=SYSTEM_PROMPT,  # System prompt via options, not embedded
        cwd="/home/user",
        permission_mode="default",
        allowed_tools=["Read", "Write"],
        max_turns=MAX_ROUNDS,
        output_format={
            "type": "json_schema",
            "schema": get_question_schema(),  # Use Pydantic-generated schema
        },
        max_buffer_size=MAX_BUFFER_SIZE,
    )

    # Session resume for continue mode
    if mode == QuestioningMode.CONTINUE and session_id:
        options.resume = session_id

    captured_session_id = None

    try:
        async for message in query(prompt=prompt, options=options):
            # Capture session_id from init message
            if isinstance(message, SystemMessage):
                if hasattr(message, "subtype") and message.subtype == "init":
                    data = getattr(message, "data", {})
                    captured_session_id = data.get("session_id")
                    emit_event("init", {"data": {"session_id": captured_session_id}})
                else:
                    emit_event("system", {"message": str(message)})

            elif isinstance(message, AssistantMessage):
                emit_event("assistant", {"message": message_to_dict(message)})

            elif isinstance(message, ResultMessage):
                # Use result_usage_to_dict to get authoritative usage from modelUsage
                # per Claude Agent SDK docs on cost tracking
                result_data = result_usage_to_dict(message)
                # Include captured session_id for backend to store
                if captured_session_id:
                    result_data["session_id"] = captured_session_id
                # Include structured output
                if hasattr(message, "structured_output") and message.structured_output:
                    result_data["structured_output"] = message.structured_output
                emit_event("result", result_data)

    except Exception as e:
        emit_error(str(e), {"exception_type": type(e).__name__})
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Questioning Agent")
    parser.add_argument(
        "--mode",
        required=True,
        choices=[m.value for m in QuestioningMode],
        help="Agent mode: first_turn, continue, or fallback",
    )
    parser.add_argument("--model", required=True, choices=[m.value for m in ClaudeSDKModel])
    parser.add_argument(
        "--initial-request", help="User's initial app request (first_turn/fallback)"
    )
    parser.add_argument("--user-response", help="User's response to previous question (continue)")
    parser.add_argument(
        "--chat-history", default="[]", help="JSON array of chat history (fallback)"
    )
    parser.add_argument("--session-id", help="SDK session ID for resume (continue)")
    parser.add_argument("--round", type=int, default=1, help="Current round number (continue)")
    args = parser.parse_args()

    # Validate required args per mode
    if args.mode == QuestioningMode.FIRST_TURN and not args.initial_request:
        emit_error("--initial-request required for first_turn mode")
        sys.exit(1)
    if args.mode == QuestioningMode.CONTINUE and (not args.user_response or not args.session_id):
        emit_error("--user-response and --session-id required for continue mode")
        sys.exit(1)
    if args.mode == QuestioningMode.FALLBACK and not args.initial_request:
        emit_error("--initial-request required for fallback mode")
        sys.exit(1)

    # Parse chat history
    try:
        chat_history = json.loads(args.chat_history) if args.chat_history != "[]" else None
    except json.JSONDecodeError:
        chat_history = None

    log_stderr(f"Questioning agent starting: mode={args.mode}, model={args.model}")
    asyncio.run(
        run_questioning(
            mode=args.mode,
            model=args.model,
            initial_request=args.initial_request,
            user_response=args.user_response,
            chat_history=chat_history,
            session_id=args.session_id,
            round_number=args.round,
        )
    )


if __name__ == "__main__":
    main()

