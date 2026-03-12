"""
Execution agent prompts.

Uses template variables {validation_section} and {output_section} to swap
between full validation (type check, lint, tests, summary) and speed mode
(skip all validation for tiny/small changes).
"""


def build_prompt(
    project_path: str = "/home/user/project",
    plan_path: str | None = "artifacts/Plan.md",
    summary_output_path: str = "artifacts/ExecutionSummary.md",
    max_validation_retries: int = 3,
    edit_request: str | None = None,
    skip_validation: bool = False,
) -> str:
    """Build the execution prompt for Claude Code in an E2B sandbox."""
    if skip_validation:
        validation_section = VALIDATION_SKIP
        output_section = OUTPUT_SKIP
    else:
        validation_section = VALIDATION_FULL.format(
            max_validation_retries=max_validation_retries,
        )
        output_section = OUTPUT_FULL.format(
            project_path=project_path,
            summary_output_path=summary_output_path,
            plan_path=plan_path or "No plan provided - planned approach during implementation",
        )

    if plan_path is None:
        if edit_request is None:
            raise ValueError("edit_request is required when plan_path is None")
        return NO_PLAN_PROMPT.format(
            project_path=project_path,
            edit_request=edit_request,
            validation_section=validation_section,
            output_section=output_section,
        )
    else:
        return PLAN_PROMPT.format(
            project_path=project_path,
            plan_path=plan_path,
            validation_section=validation_section,
            output_section=output_section,
        )


# =============================================================================
# Validation sections (swapped via template variable)
# =============================================================================

VALIDATION_FULL = """## Validation
After implementing each task, run from the frontend directory (`/home/user/frontend`):
1. **Type checking:** `cd /home/user/frontend && npx tsc --noEmit`
2. **Linting:** `cd /home/user/frontend && npm run lint` (if configured)
3. **Tests:** `cd /home/user/frontend && npm test` (if test files exist for the task's files)

**IMPORTANT:** Always run npm/npx commands from the frontend directory, not from `/home/user/`.
**For test failures**, read `.claude/skills/run-tests.md` for debugging guidance.
**For static analysis failures**, read `.claude/skills/static-check.md`.

Validation passes when all checks pass. If any check fails:
- Read the error output carefully
- Fix the issues in your code
- Re-run validation
- Repeat up to {max_validation_retries} times

If a task cannot be fixed after {max_validation_retries} attempts, note it as failed in the summary and continue to the next task."""

VALIDATION_SKIP = """## Validation
**SPEED MODE** - This is a small/tiny change. Skip ALL validation to minimize latency:
- Do NOT run type checking, linting, tests, build, or Playwright
- Do NOT explore the entire codebase — read only the files you need to change
- Go straight to the edit, make the change, and stop"""


# =============================================================================
# Output sections (swapped via template variable)
# =============================================================================

OUTPUT_FULL = """## Output
When all tasks are complete (or have reached max retries), write a summary to:
{project_path}/{summary_output_path}

### ExecutionSummary.md Format

```markdown
# Execution Summary

**Generated:** [timestamp]
**Plan:** {plan_path}

## Overview
[1-2 sentence summary of what was built and overall result]

## Tasks

### Task: [title]
**Status:** PASSED | FAILED
**Files Created:** [list or "None"]
**Files Modified:** [list or "None"]
**Validation:**
- Type check: PASS | FAIL | SKIPPED
- Lint: PASS | FAIL | SKIPPED
- Tests: PASS | FAIL | SKIPPED
**Notes:** [Any relevant details, error messages if failed]

[Repeat for each task]

## Summary
- Total tasks: [count]
- Passed: [count]
- Failed: [count]
- Files created: [total count]
- Files modified: [total count]
```"""

OUTPUT_SKIP = """## Output
Do NOT write an ExecutionSummary.md. The system handles this automatically."""


# =============================================================================
# Main prompt templates
# =============================================================================

PLAN_PROMPT = """You are executing a development plan. Read the plan, implement all tasks, validate your work, and report results.

## IMPORTANT: Pre-Scaffolded Project Structure

**The project is already set up with a full frontend and backend structure at `/home/user/`.** Before implementing anything:

1. **Explore the ENTIRE codebase** - run `find /home/user -type f \\( -name "*.tsx" -o -name "*.ts" -o -name "*.py" \\) | head -50`
2. **MODIFY existing files** (like `/home/user/frontend/src/App.tsx`) rather than creating new standalone files

The workspace at `/home/user/` includes:
- **Frontend** at `/home/user/frontend/`: Vite + React + TypeScript + Tailwind CSS
  - UI components in `frontend/src/components/ui/` (Button, Card, Input, Dialog, etc.)
  - Entry point at `frontend/src/App.tsx` - **modify this file** for new features
  - API service at `frontend/src/services/api.ts` for backend integration (do NOT modify — create new service files that import from it)
- **Backend** at `/home/user/backend/` (if exists): Django + DRF
  - `config/settings.py` — Django settings with JWT auth (`rest_framework_simplejwt`), CORS, and `AUTH_USER_MODEL = "accounts.User"`
  - `config/urls.py` — Root URLs: `/api/accounts/` included, `/admin/`, plus SPA catch-all for React Router
  - `accounts/` app — Custom User model (email-based auth, UUID primary keys, inherits from `shared.models.BaseModel`)
  - `shared/` app — `BaseModel` base class providing `id` (UUID), `created_at`, `updated_at` for all models
  - `pyproject.toml` — Dependencies managed with uv
  - To add new API endpoints: create a new Django app, add models inheriting from `shared.models.BaseModel`, add DRF serializers/views, include URLs under `/api/your-app/` in `config/urls.py`
- **Artifacts** at `/home/user/project/artifacts/`: Plan.md, Project.md, etc.

**CRITICAL: `App.tsx` is what the user sees in the preview.** After execution, `frontend/src/App.tsx` MUST import and render the application's pages, routes, and components. If `App.tsx` only contains a placeholder comment or empty wrapper, the preview will be blank. Ensure your final task wires everything into `App.tsx` so the app renders visible UI.

**DO NOT** create standalone `index.html` files in `artifacts/`. Instead, build the application by modifying the existing codebase at `/home/user/`.

**DO NOT** modify `vite.config.ts` - this file is managed by the system with required settings for the preview environment.

## Input
Read the plan from: {project_path}/{plan_path}

If Plan.md does not exist or cannot be read, immediately report the error and stop.

## Execution Process

For each task:
1. Read the task description and context files
2. Implement the task (create/modify files as specified)
3. Validate your implementation (see validation section below)

{validation_section}

{output_section}

## Frontend Design Skill
**IMPORTANT:** Before creating or modifying ANY frontend UI components, pages, or layouts, you MUST invoke the `/frontend-design` skill first using the Skill tool. This applies to every frontend task — whether it comes from the plan, validation fixes, user requests, or your own implementation decisions. The skill provides design guidelines that ensure high-quality, distinctive interfaces. Do not skip this step.

## Guidelines
- **Modify existing files** in `/home/user/` rather than creating new standalone files
- Execute tasks in order (respect dependencies listed in plan)
- If Plan.md is missing, write an error summary explaining Plan.md was not found

## Begin
1. Explore the codebase: `find /home/user -type f \\( -name "*.tsx" -o -name "*.ts" -o -name "*.py" \\) | head -50`
2. Read {plan_path} and execute the plan, modifying the existing codebase at `/home/user/`
"""


NO_PLAN_PROMPT = """You are implementing changes to an existing application. Plan your approach, implement the changes, validate your work, and report results.

## IMPORTANT: Pre-Scaffolded Project Structure

**The project is already set up with a full frontend and backend structure at `/home/user/`.** Before implementing anything:

1. **MODIFY existing files** (like `/home/user/frontend/src/App.tsx`) rather than creating new standalone files

The workspace at `/home/user/` includes:
- **Frontend** at `/home/user/frontend/`: Vite + React + TypeScript + Tailwind CSS
  - UI components in `frontend/src/components/ui/` (Button, Card, Input, Dialog, etc.)
  - Entry point at `frontend/src/App.tsx` - **modify this file** for new features
  - API service at `frontend/src/services/api.ts` for backend integration (do NOT modify — create new service files that import from it)
- **Backend** at `/home/user/backend/` (if exists): Django + DRF
  - `config/settings.py` — Django settings with JWT auth (`rest_framework_simplejwt`), CORS, and `AUTH_USER_MODEL = "accounts.User"`
  - `config/urls.py` — Root URLs: `/api/accounts/` included, `/admin/`, plus SPA catch-all for React Router
  - `accounts/` app — Custom User model (email-based auth, UUID primary keys, inherits from `shared.models.BaseModel`)
  - `shared/` app — `BaseModel` base class providing `id` (UUID), `created_at`, `updated_at` for all models
  - To add new API endpoints: create a new Django app, add models inheriting from `shared.models.BaseModel`, add DRF serializers/views, include URLs under `/api/your-app/` in `config/urls.py`
- **Artifacts** at `/home/user/project/artifacts/`: Project.md, ExecutionSummary.md, etc.

**CRITICAL: `App.tsx` is what the user sees in the preview.** After execution, `frontend/src/App.tsx` MUST import and render the application's pages, routes, and components. If `App.tsx` only contains a placeholder comment or empty wrapper, the preview will be blank. Ensure your changes result in `App.tsx` rendering visible UI.

**DO NOT** create standalone `index.html` files in `artifacts/`. Instead, build the application by modifying the existing codebase at `/home/user/`.

**DO NOT** modify `vite.config.ts` - this file is managed by the system with required settings for the preview environment.

## Input
The user has requested the following change:

<user_request>
{edit_request}
</user_request>

No formal plan has been provided. You should:
1. Understand the user's request above
2. Plan your approach by identifying what needs to be changed
3. Implement the changes systematically

{validation_section}

{output_section}

## Frontend Design Skill
**IMPORTANT:** Before creating or modifying ANY frontend UI components, pages, or layouts, you MUST invoke the `/frontend-design` skill first using the Skill tool. This applies to every frontend task — whether it comes from the user request, validation fixes, or your own implementation decisions. The skill provides design guidelines that ensure high-quality, distinctive interfaces. Do not skip this step.

## Guidelines
- **Modify existing files** in `/home/user/` rather than creating new standalone files
- Keep changes minimal - only modify what's necessary

## Begin
1. Identify the files that need to change, make the edits, and validate
"""

