"""
Planning agent prompts.

Moved from chat/prompts/planning_prompts.py.
"""


def build_prompt(
    project_path: str = "/home/user/project",
    project_md_path: str = "artifacts/Project.md",
    plan_output_path: str = "artifacts/Plan.md",
) -> str:
    """Build the planning prompt for Claude Code in an E2B sandbox."""
    return f"""You are planning an app based on requirements.

## Your Task
Read the project document (which contains both project context AND requirements), then create an execution plan.

## IMPORTANT: Pre-Scaffolded Project Structure

**The project already has a full frontend and backend structure at `/home/user/`.** Before planning:

1. **Explore the ENTIRE codebase** - run `find /home/user -type f -name "*.tsx" -o -name "*.ts" -o -name "*.py" | head -50` to see what exists
2. **Understand the full structure** - run `ls -laR /home/user/frontend/src` and `ls -laR /home/user/backend` (if exists)

The workspace at `/home/user/` includes:
- **Frontend** at `/home/user/frontend/`: Vite + React + TypeScript + Tailwind CSS
  - UI components in `frontend/src/components/ui/` (Button, Card, Input, Dialog, etc.)
  - Entry point at `frontend/src/App.tsx` — this is what the user sees in the preview
  - API service at `frontend/src/services/api.ts` (do NOT modify — create new service files that import from it)
- **Backend** at `/home/user/backend/` (if exists): Django + DRF
  - `config/settings.py` — Django settings with JWT auth (`rest_framework_simplejwt`), CORS, and `AUTH_USER_MODEL = "accounts.User"`
  - `config/urls.py` — Root URLs: `/api/accounts/` included, `/admin/`, plus SPA catch-all for React Router
  - `accounts/` app — Custom User model (email-based auth, UUID primary keys, inherits from `shared.models.BaseModel`)
  - `shared/` app — `BaseModel` base class providing `id` (UUID), `created_at`, `updated_at` for all models
  - To add new API endpoints: create a new Django app, add models inheriting from `shared.models.BaseModel`, add DRF serializers/views, include URLs under `/api/your-app/` in `config/urls.py`
- **Artifacts** at `/home/user/project/artifacts/`: Plan.md, Project.md, etc.

**CRITICAL: `App.tsx` is what the user sees in the preview.** Your plan MUST include a task that wires all pages/routes/components into `frontend/src/App.tsx`. If `App.tsx` only contains a placeholder or empty wrapper after execution, the preview will be blank.

**Your plan should MODIFY these existing files** rather than creating standalone `index.html` files.

## Input File
- {project_path}/{project_md_path} - Project context AND requirements gathered during questioning

## Output
Write your plan to: {project_path}/{plan_output_path}

## Plan Format
The Plan.md must follow this structure:

```markdown
# Plan: [Goal Summary]

Generated: [timestamp]
Source: Project.md

## Overview
[1-2 sentence summary of what will be built]

## Tasks

### [task-id] [Title]
**Description:** [Detailed description of what to do - imperative voice]
**Context:** [Files to read for context, comma-separated]
**Creates:** [Files this task creates, comma-separated]
**Modifies:** [Files this task modifies, comma-separated, or "None"]
**Depends on:** [Task indices that must complete first, comma-separated, or "None"]
**Verification:** [How to verify task succeeded - testable criteria]

### [task-id] [Title]
...

## Summary
- Total tasks: [count]
- Files created: [count]
- Files modified: [count]
- Estimated complexity: [low/medium/high]
```

## Guidelines
- **First explore the existing project structure** before writing the plan
- **Plan to modify existing files** (like `/home/user/frontend/src/App.tsx`) rather than creating standalone files
- **Use the existing UI components** in `/home/user/frontend/src/components/ui/`. Do NOT generate the tokens.css file, it will be \
provided by a different agent.
- **NEVER modify `vite.config.ts`** - this file is managed by the system with required settings
- Break work into 3-10 tasks (warn if more than 10 tasks needed)
- Each task should be independently verifiable
- Specify which files each task creates/modifies
- Include verification criteria for each task
- Tasks with no dependencies should list "None" for Depends on
- Order tasks by dependency (earlier tasks first)
- Use imperative voice for descriptions ("Create...", "Add...", "Update...")
- Be specific about what each task produces

## Task Granularity
- Each task should take 5-30 minutes to execute
- Avoid tasks that are too large (entire feature) or too small (single line change)
- Group related changes into single tasks when they must be done together
- Split independent concerns into separate tasks for parallel execution

## Dependency Rules
- A task can only depend on tasks with lower indices
- Clearly state file dependencies in the Context field

## Playwright Component Tests
Include tasks to add Playwright tests for new frontend components. This can all be done in parallel. Tests should:
- Live in `frontend/tests/e2e/` alongside the existing `app.spec.ts`
- Test component behavior, user interactions, and visual states
- Use semantic `data-testid` selectors (e.g., `projects.list.item`, `auth.login.submit`)
- Cover happy path and key edge cases for each new component

## Begin
1. Explore the ENTIRE project structure: `find /home/user -type f \\( -name "*.tsx" -o -name "*.ts" -o -name "*.py" \\) | head -50`
2. Read Project.md (contains both project context and requirements)
3. Write Plan.md with tasks that modify the existing codebase at `/home/user/`
"""


def build_edit_planning_prompt(
    edit_request: str,
    project_path: str = "/home/user/project",
    plan_output_path: str = "artifacts/Plan.md",
) -> str:
    """
    Build the planning prompt for editing an existing app.

    Unlike build_planning_prompt, this takes the user's edit request directly
    rather than reading from Requirements.md. The edit request is included
    in the prompt itself.

    Args:
        edit_request: The user's edit request (e.g., "remove the login button").
        project_path: Base path in the E2B sandbox (default: /home/user/project).
        plan_output_path: Relative path where Plan.md should be written.

    Returns:
        Complete prompt string for Claude Code.
    """
    return f"""You are planning an edit to an existing application.

## Edit Request
<user_request>
{edit_request}
</user_request>

## Your Task
Understand the user's edit request, explore the existing codebase, and create a focused execution plan.

## IMPORTANT: This is an EDIT to an Existing App

**The application already exists at `/home/user/`.** Before planning:

1. **Explore the ENTIRE codebase** - run `find /home/user -type f \\( -name "*.tsx" -o -name "*.ts" -o -name "*.py" \\) | head -100`
2. **Understand what exists** - run `ls -laR /home/user/frontend/src` and `ls -laR /home/user/backend` (if exists)
3. **Find the relevant code** - search for the code related to the edit request

The workspace at `/home/user/` includes:
- **Frontend** at `/home/user/frontend/`: Vite + React + TypeScript + Tailwind CSS
  - Entry point at `frontend/src/App.tsx` — this is what the user sees in the preview
  - UI components in `frontend/src/components/ui/` (Button, Card, Input, Dialog, etc.)
  - API service at `frontend/src/services/api.ts` (do NOT modify — create new service files that import from it)
- **Backend** at `/home/user/backend/` (if exists): Django + DRF
  - `config/settings.py` — Django settings with JWT auth, CORS, `AUTH_USER_MODEL = "accounts.User"`
  - `config/urls.py` — Root URLs: `/api/accounts/`, `/admin/`, SPA catch-all
  - `accounts/` app — Custom User model (email-based, UUID PKs, inherits `shared.models.BaseModel`)
  - `shared/` app — `BaseModel` base class (UUID `id`, `created_at`, `updated_at`)
- **Artifacts** at `/home/user/project/artifacts/`: Plan.md, Project.md, etc.

## Output
Write your plan to: {project_path}/{plan_output_path}

## Plan Format
The Plan.md must follow this structure:

```markdown
# Plan: [Edit Summary]

Generated: [timestamp]
Source: User Edit Request

## Overview
[1-2 sentence summary of the edit to be made]

## Tasks

### Task 1: [task-01] [Title]
**Description:** [Detailed description of what to do - imperative voice]
**Context:** [Files to read for context, comma-separated]
**Creates:** [Files this task creates, comma-separated, or "None"]
**Modifies:** [Files this task modifies, comma-separated]
**Depends on:** [Task IDs that must complete first, or "None"]
**Verification:** [How to verify task succeeded - testable criteria]

### Task 2: [task-02] [Title]
...

## Summary
- Total tasks: [count]
- Files created: [count]
- Files modified: [count]
- Estimated complexity: [low/medium/high]
```

## Guidelines for Edits
- **Keep changes minimal** - only modify what's necessary for the edit request
- **Explore first** - find the exact files and code that need to change
- **Be surgical** - don't refactor or change unrelated code
- **NEVER modify `vite.config.ts`** - this file is managed by the system
- For simple edits (text changes, style tweaks), 1-2 tasks is fine
- For larger edits (new features, structural changes), break into logical tasks
- Each task should be independently verifiable

## Playwright Component Tests (Only for NEW Components)
**Only add Playwright tests when the edit request involves creating NEW frontend components. This can all be done in at the same time.**
Do NOT add tests for:
- Modifying existing components (styling, text changes, bug fixes)
- Backend-only changes
- Configuration or infrastructure changes

When new components ARE being added, include tasks to add Playwright tests that:
- Live in `frontend/tests/e2e/` alongside the existing `app.spec.ts`
- Test component behavior, user interactions, and visual states
- Use semantic `data-testid` selectors (e.g., `projects.list.item`, `auth.login.submit`)
- Cover happy path and key edge cases for the new component

## Begin
1. Explore the codebase to understand what exists
2. Search for code related to the edit request
3. Write a focused Plan.md for the edit
"""

