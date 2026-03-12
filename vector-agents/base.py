"""
Base utilities for E2B agent scripts.

All agent scripts output NDJSON to stdout for the backend to parse.
Each line is a JSON object with a 'type' field matching SDK message types.
"""

import json
import sys
from typing import Any

# Max buffer size for Claude Agent SDK message reader (default is 1MB).
# Large file reads (e.g. base64-encoded images, big JSON) can exceed the default.
MAX_BUFFER_SIZE = 10 * 1024 * 1024  # 10MB


def emit_event(event_type: str, data: dict[str, Any]) -> None:
    """
    Emit an NDJSON event to stdout.

    Args:
        event_type: Event type (e.g., "assistant", "result", "system")
        data: Event data payload
    """
    event = {"type": event_type, **data}
    print(json.dumps(event))
    sys.stdout.flush()


def emit_error(error: str, details: dict[str, Any] | None = None) -> None:
    """Emit an error event."""
    emit_event("error", {"error": error, **(details or {})})


def log_stderr(message: str) -> None:
    """Log a message to stderr (for debugging, not parsed by backend)."""
    print(message, file=sys.stderr)
    sys.stderr.flush()


def content_block_to_dict(block: Any) -> dict[str, Any]:
    """
    Serialize SDK content block to dict for NDJSON output.

    Produces format expected by SDKStreamMapper:
    - TextBlock: {"type": "text", "text": "..."}
    - ThinkingBlock: {"type": "thinking", "thinking": "..."}
    - ToolUseBlock: {"type": "tool_use", "id": "...", "name": "...", "input": {...}}
    - ToolResultBlock: {"type": "tool_result", "tool_use_id": "...", "content": "..."}
    """
    block_type = getattr(block, "type", None)

    # TextBlock
    if block_type == "text" or hasattr(block, "text") and not hasattr(block, "thinking"):
        return {"type": "text", "text": getattr(block, "text", "")}

    # ThinkingBlock
    if block_type == "thinking" or hasattr(block, "thinking"):
        return {"type": "thinking", "thinking": getattr(block, "thinking", "")}

    # ToolUseBlock
    if block_type == "tool_use" or hasattr(block, "name") and hasattr(block, "input"):
        return {
            "type": "tool_use",
            "id": getattr(block, "id", ""),
            "name": getattr(block, "name", ""),
            "input": getattr(block, "input", {}),
        }

    # ToolResultBlock
    if block_type == "tool_result" or hasattr(block, "tool_use_id"):
        return {
            "type": "tool_result",
            "tool_use_id": getattr(block, "tool_use_id", ""),
            "content": getattr(block, "content", ""),
        }

    # Fallback
    return {"type": "unknown", "repr": repr(block)}


def message_to_dict(message: Any) -> dict[str, Any]:
    """
    Serialize AssistantMessage to dict for NDJSON output.

    Produces format expected by SDKStreamMapper:
    {"content": [<content_block_dicts>]}
    """
    content = getattr(message, "content", [])
    return {
        "content": [content_block_to_dict(block) for block in content],
    }


def result_usage_to_dict(message: Any) -> dict[str, Any]:
    """
    Extract usage info from ResultMessage for cost tracking.

    IMPORTANT: Per Claude Agent SDK docs, use modelUsage from the final
    ResultMessage as the authoritative source for billing. Don't sum
    intermediate message token counts.

    Token calculation notes:
    - usage.input_tokens only shows uncached input tokens
    - Cache tokens are tracked separately in cache_read_input_tokens
      and cache_creation_input_tokens
    - Total input = input_tokens + cache_creation_input_tokens + cache_read_input_tokens
    - The cost calculation already accounts for all token types including cache

    Returns dict with all usage fields for the backend to parse.
    """
    result = {
        "total_cost_usd": getattr(message, "total_cost_usd", 0),
        "num_turns": getattr(message, "num_turns", 0),
    }

    # Try modelUsage first (authoritative for billing per SDK docs)
    model_usage = getattr(message, "model_usage", None) or getattr(message, "modelUsage", None)
    if model_usage:
        # modelUsage contains per-model breakdown with accurate token counts
        # It may be a dict keyed by model name, or a single usage object
        if isinstance(model_usage, dict):
            # Sum across all models if multiple
            total_input = 0
            total_output = 0
            total_cache_read = 0
            total_cache_create = 0
            for _, usage in model_usage.items():
                if hasattr(usage, "input_tokens"):
                    total_input += getattr(usage, "input_tokens", 0)
                    total_output += getattr(usage, "output_tokens", 0)
                    total_cache_read += getattr(usage, "cache_read_input_tokens", 0)
                    total_cache_create += getattr(usage, "cache_creation_input_tokens", 0)
                elif isinstance(usage, dict):
                    total_input += usage.get("input_tokens", 0)
                    total_output += usage.get("output_tokens", 0)
                    total_cache_read += usage.get("cache_read_input_tokens", 0)
                    total_cache_create += usage.get("cache_creation_input_tokens", 0)
            result["total_input_tokens"] = total_input
            result["total_output_tokens"] = total_output
            result["total_cache_read_input_tokens"] = total_cache_read
            result["total_cache_creation_input_tokens"] = total_cache_create
        else:
            # Single usage object
            result["total_input_tokens"] = getattr(model_usage, "input_tokens", 0)
            result["total_output_tokens"] = getattr(model_usage, "output_tokens", 0)
            result["total_cache_read_input_tokens"] = getattr(
                model_usage, "cache_read_input_tokens", 0
            )
            result["total_cache_creation_input_tokens"] = getattr(
                model_usage, "cache_creation_input_tokens", 0
            )
    else:
        # Fall back to usage aggregate field
        usage = getattr(message, "usage", None)
        if usage:
            if hasattr(usage, "input_tokens"):
                result["total_input_tokens"] = getattr(usage, "input_tokens", 0)
                result["total_output_tokens"] = getattr(usage, "output_tokens", 0)
                result["total_cache_read_input_tokens"] = getattr(
                    usage, "cache_read_input_tokens", 0
                )
                result["total_cache_creation_input_tokens"] = getattr(
                    usage, "cache_creation_input_tokens", 0
                )
            elif isinstance(usage, dict):
                result["total_input_tokens"] = usage.get("input_tokens", 0)
                result["total_output_tokens"] = usage.get("output_tokens", 0)
                result["total_cache_read_input_tokens"] = usage.get("cache_read_input_tokens", 0)
                result["total_cache_creation_input_tokens"] = usage.get(
                    "cache_creation_input_tokens", 0
                )
        else:
            # Ultimate fallback to top-level fields
            result["total_input_tokens"] = getattr(message, "total_input_tokens", 0)
            result["total_output_tokens"] = getattr(message, "total_output_tokens", 0)
            result["total_cache_read_input_tokens"] = getattr(
                message, "total_cache_read_input_tokens", 0
            )
            result["total_cache_creation_input_tokens"] = getattr(
                message, "total_cache_creation_input_tokens", 0
            )

    return result

