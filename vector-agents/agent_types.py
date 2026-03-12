"""Type definitions for agent scripts.

Renamed from types.py to avoid conflict with Python stdlib types module.
"""

from dataclasses import dataclass
from enum import StrEnum
from typing import Any


class ClaudeSDKModel(StrEnum):
    """Supported Claude models - use full model IDs.

    Examples:
        ClaudeSDKModel.OPUS    -> "claude-opus-4-6"
        ClaudeSDKModel.SONNET  -> "claude-sonnet-4-6"
        ClaudeSDKModel.HAIKU   -> "claude-haiku-4-5"
    """

    OPUS = "claude-opus-4-6"
    SONNET = "claude-sonnet-4-6"
    HAIKU = "claude-haiku-4-5"


class AgentScript(StrEnum):
    """Agent scripts available in E2B sandbox."""

    PLANNING = "planning"
    EXECUTION = "execution"
    QUESTIONING = "questioning"


@dataclass
class AgentConfig:
    """Configuration for agent execution.

    SECURITY NOTE (VEC-351): permission_mode="bypassPermissions" is intentional.
    Agent scripts run inside ephemeral E2B sandboxes that are destroyed after use.
    The sandbox is fully isolated from the host and from other users' sandboxes.
    Bypassing permission prompts is required because there is no human operator to
    approve each file write / command execution during automated code generation.
    Sensitive credentials (ANTHROPIC_API_KEY) are passed per-process, not globally,
    and DATABASE_URL only points to isolated per-app Turso branches (see VEC-349).
    """

    model: str = ClaudeSDKModel.SONNET
    cwd: str = "/home/user"
    permission_mode: str = "bypassPermissions"
    max_turns: int | None = None
    resume_session_id: str | None = None
    output_format: dict[str, Any] | None = None
    allowed_tools: list[str] | None = None


def get_default_config() -> AgentConfig:
    """Get default agent configuration."""
    return AgentConfig()

