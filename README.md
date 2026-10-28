# Playwright QA Automation Framework

A Playwright + TypeScript QA portfolio covering UI, API, integration, and network-mocking tests, with two AI-assisted testing workflows built on the OpenAI Agents SDK.

## Features

- Page Object Model, custom fixtures, data-driven tests, and authentication state.
- API CRUD, authentication, negative testing, and Zod response validation.
- API + UI integration testing with cleanup.
- Network mocking, HTML reports, screenshots, videos, and traces.
- GitHub Actions CI with QA / Staging environment configuration.
- Requirement-driven AI test generation and browser testing.

## Getting Started

Requires Node.js LTS and npm.

```bash
npm ci
npx playwright install chromium
```

Copy `.env.example` to `.env` and configure:

```dotenv
BASE_URL=https://www.saucedemo.com/
API_BASE_URL=https://dummyjson.com
TEST_USERNAME=your_demo_username
TEST_PASSWORD=your_demo_password
BOOKER_UI_BASE_URL=https://automationintesting.online
BOOKER_API_BASE_URL=https://automationintesting.online
```

AI workflows also require `OPENAI_API_KEY`. OpenAI API usage is billed separately from ChatGPT subscriptions.

Run the existing test suite:

```bash
npx playwright test
```

Run selected projects or view the HTML report:

```bash
npx playwright test --project=login-tests --project=api
npx playwright show-report
```

Tests depend on external demo services, so availability and shared test data can affect results.

## Test Coverage

| Area | Examples |
| --- | --- |
| UI | Login, products, cart, checkout, field validation, totals, receipt download |
| API | CRUD, authentication, protected endpoints, invalid requests, response schemas |
| Integration | Create bookings through API, verify in Admin UI, clean up afterward |
| Network mocking | Mock branding responses and validate error handling |

## AI QA Workflow

The TypeScript Orchestrator coordinates three AI agents and a deterministic Playwright runner:

```text
Markdown Requirement
    → Planner Agent
    → Framework Context Selection
    → Generator Agent
    → Playwright Runner
    → Analyzer Agent
```

The workflow reuses existing Page Objects, fixtures, and test data. Generated tests are stored separately from the maintained test suite.

The Analyzer returns `PASSED`, `PRODUCT_BUG`, `TEST_CODE_ISSUE`, `FRAMEWORK_ISSUE`, `ENVIRONMENT_ISSUE`, or `UNKNOWN`. Classifications are diagnostic findings and should be reviewed alongside execution evidence.

### Run Requirements

Add Markdown requirements under `ai-agents/requirements/`, including a user story and acceptance criteria.

Run all pending requirements:

```bash
npx tsx ai-agents/orchestrator.ts
```

Run one requirement:

```bash
npx tsx ai-agents/orchestrator.ts --requirement add-to-cart-story.md
```

Requirements are processed sequentially. A failure in one requirement does not stop the remaining requirements.

### Requirement Status Tracking

The Orchestrator saves the latest status of each requirement in:

```text
ai-agents/runs/requirement-status.json
```

| Status | Behavior |
| --- | --- |
| No record | Execute the workflow |
| `completed` | Skip the requirement |
| `failed` | Allow execution on a subsequent invocation |

A requirement is completed only when Playwright execution succeeds and the Analyzer returns `PASSED`.

Records include the status, run ID when available, and update time. Failed records also capture the failure type, stage, and error or analysis reason.

Two failure types are distinguished:

- **`WORKFLOW_ERROR`**: An exception interrupts preparation, planning, generation, execution, analysis, or artifact saving.
- **`TEST_RESULT`**: Execution and analysis finish, but the result does not meet the completion criteria.

Stages are `prepare`, `plan`, `generate`, `run`, `analyze`, and `save-results`. An unsuccessful test outcome is attributed to `run`; successful execution with a non-passing analysis is attributed to `analyze`.

Workflow failures are recorded without stopping subsequent requirements. If the status file cannot be saved, the Orchestrator invocation stops.

Tracking uses filenames, so editing a completed file does not automatically rerun it. Legacy records containing only `runId` remain recognized as completed; their unknown update time is represented as `null`.

### Watch for New Requirements

```bash
npx tsx ai-agents/watchRequirements.ts
```

The watcher:

- Checks existing and newly added Markdown files.
- Waits for matching content hashes across two consecutive scans.
- Processes requirements sequentially.
- Attempts each filename at most once per watcher session, including failed attempts.

The current polling interval is two minutes, configured through `pollInterval`. Newly added files typically become eligible after two to four minutes; running workflows can add further delay.

Keep the terminal open and press `Ctrl+C` to stop. Run only one watcher or Orchestrator process at a time.

### Retry a Requirement

For a failed requirement, stop the watcher if it is running, then execute:

```bash
npx tsx ai-agents/orchestrator.ts --requirement add-to-cart-story.md
```

Failed records do not prevent retries. Each retry starts from planning and replaces the requirement's latest status; previous run artifacts remain in their own directories.

Restarting the watcher also makes failed requirements eligible again. Automatic retries within the same watcher session and resuming from an interrupted stage are not implemented.

To rerun a completed requirement:

1. Stop the watcher.
2. Remove only that requirement's entry from `requirement-status.json`.
3. Run the requirement manually or restart the watcher.

Keep the JSON valid and preserve other records. Deleting the entire status file makes all requirements eligible again.

### Run Artifacts

Each workflow execution saves its artifacts in a separate directory:

```text
ai-agents/runs/<run-id>/
├── test-plan.md
├── generated.spec.ts
├── runner-result.json
└── analysis.json
```

The completion record is separate from these per-run directories.

## MCP-Based Browser Testing

A separate workflow uses Playwright MCP to let an AI agent observe the browser, choose actions, and evaluate testing goals directly.

```text
Markdown Testing Goal
    → MCP Test Agent + Playwright MCP
    → Browser Interaction
    → Result JSON + Batch Summary
```

Run it with:

```bash
npx tsx mcp-testing/orchestrator.ts
```

Requirements are read from `mcp-testing/requirements/`; results are saved under `mcp-testing/runs/`.

Each requirement uses an independent MCP/browser session. This workflow does not use the AI QA workflow's watcher or completion tracking.

## Project Structure

```text
ai-agents/       AI agents, orchestration, watcher, requirements, and run artifacts
mcp-testing/     MCP browser-testing workflow and requirements
config/          Environment configuration
pages/           Page Objects
fixtures/        Custom Playwright fixtures
helpers/         Shared utilities and business flows
schemas/         API response schemas
test-data/       Reusable test data
tests/           UI, API, integration, networking, and authentication setup
```

## Security

Keep credentials in the ignored `.env` file and commit only placeholders in `.env.example`.

Authentication state, test outputs, and AI runtime artifacts are excluded from Git. A sanitized sample AI run is retained for demonstration. Review generated artifacts before sharing them.

## Author

**Si Wei Wang** — QA Automation Engineer | QA Leadership

[GitHub](https://github.com/siwei-wang-qa) ·
[LinkedIn](https://www.linkedin.com/in/si-wei-wang-1432483a)