"""
Questioning agent Pydantic models.

Copied from apps/backend/agent/agents/questioning/types.py.
Named schemas.py (not types.py) to avoid conflict with Python stdlib types module.
"""

from pydantic import BaseModel, Field


class QuestionOption(BaseModel):
    """A single option for a question."""

    label: str = Field(..., description="Short label for the option")
    description: str = Field(..., description="Explanation of what this option means")


class QuestionOutput(BaseModel):
    """Structured output from Claude Code questioning turn."""

    question: str = Field(..., description="The question to ask the user")
    options: list[QuestionOption] = Field(
        ...,
        min_length=3,
        max_length=4,
        description="3-4 options for the user to choose from",
    )
    phase_complete: bool = Field(
        ...,
        description="True if enough information gathered to create artifact",
    )
    artifact_created: str | None = Field(
        default=None,
        description="Filename of created artifact (Project.md) if phase_complete",
    )

    @classmethod
    def from_claude_output(cls, raw_json: dict) -> "QuestionOutput":
        """Parse and validate Claude Code JSON output."""
        return cls.model_validate(raw_json)


def get_question_schema() -> dict:
    """Get JSON schema for SDK output_format."""
    return QuestionOutput.model_json_schema()

