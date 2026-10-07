# Playwright QA Automation Framework

A practical **Playwright + TypeScript** automation framework demonstrating modern QA automation practices across UI, API, integration, CI, and **AI-assisted test automation**.

The project also includes an **AI QA Agent workflow** that analyzes software requirements, creates test plans, discovers relevant framework components, generates Playwright tests, executes them, and analyzes test results.

## Highlights

- Playwright + TypeScript
- Page Object Model
- Custom fixtures
- `storageState` authentication
- Data-driven testing
- UI / API / Integration test separation
- API CRUD and negative testing
- Token-based authentication
- Zod response validation
- API + UI integration testing
- Playwright network mocking
- GitHub Actions CI
- QA / Staging environments
- Secrets-based configuration
- HTML reports and test artifacts
- **AI-assisted requirement analysis**
- **AI-generated test planning**
- **Framework-aware Playwright test generation**
- **Automated test execution and failure analysis**
- **Run-isolated AI workflow artifacts**

---

## AI-Assisted QA Agent

The project includes an AI-assisted QA workflow built with the OpenAI Agents SDK.

Instead of generating standalone test scripts without framework awareness, the workflow analyzes the existing Playwright framework and reuses available Page Objects, fixtures, and test data.

### Workflow

```text
Requirement / User Story
          ↓
     Planner Agent
          ↓
       Test Plan
          ↓
Framework Context Selector
          ↓
     Generator Agent
          ↓
 Generated Playwright Test
          ↓
   Playwright Runner
          ↓
     Analyzer Agent
          ↓
   Execution Analysis
```

### Planner Agent

Analyzes requirements and acceptance criteria and produces a structured QA test plan.

Key responsibilities:

- Identify required test scenarios
- Maintain acceptance-criteria traceability
- Avoid duplicate or overlapping test cases
- Separate required tests from recommended tests
- Identify requirement clarifications instead of inventing behavior

### Framework Context Selector

Dynamically inspects the available automation framework and selects only the components relevant to the current test plan.

It can select from:

- Page Objects
- Playwright fixtures
- Test data

AI is used for contextual selection, while deterministic Node.js code validates file existence, reads files, and resolves import paths.

### Generator Agent

Generates executable **Playwright + TypeScript** tests from the Planner output.

The Generator is instructed to:

- Reuse existing Page Objects
- Reuse existing fixtures
- Reuse existing test data
- Avoid inventing selectors or framework APIs
- Generate only required test cases
- Keep generated code isolated from the existing test suite

### Playwright Runner

Executes the exact generated test using a dedicated Playwright configuration.

The Runner captures:

- Execution status
- Exit code
- Standard output
- Error output

The Runner itself does not interpret failures.

### Analyzer Agent

Analyzes the complete test context:

```text
Requirement
+ Test Plan
+ Generated Test
+ Playwright Execution Result
```

It returns a structured classification:

- `PASSED`
- `PRODUCT_BUG`
- `TEST_CODE_ISSUE`
- `FRAMEWORK_ISSUE`
- `ENVIRONMENT_ISSUE`
- `UNKNOWN`

This separates failure diagnosis from test execution.

---

## Run Isolation

Each workflow execution receives its own `RunContext`.

Runtime artifacts are grouped into an isolated run directory:

```text
ai-agents/runs/<run-id>/
├── test-plan.md
├── generated.spec.ts
├── runner-result.json
└── analysis.json
```

This prevents artifacts from different requirements or executions from being mixed together.

Runtime directories are excluded from Git.

---

## AI Workflow Design Principles

The AI workflow follows several design principles:

- **Use AI for reasoning and deterministic code for deterministic operations**
- Keep workflow orchestration separate from individual agents
- Pass exact outputs between components instead of searching for the "latest" file
- Reuse the existing automation framework instead of generating isolated test code
- Validate AI-selected framework files against the actual repository
- Keep AI-generated tests isolated from the mature automation suite
- Do not allow agents to automatically modify existing framework files

The workflow is coordinated by a deterministic TypeScript **Orchestrator**, rather than using an LLM to control predictable workflow sequencing.

---

## Test Coverage

### UI

- Valid / invalid login
- Product and cart flows
- Full checkout
- Required-field validation
- Multi-item checkout
- Remove-item validation
- Price, tax, and total validation
- Order completion
- PDF download and file validation

### API

- GET / POST / PATCH / DELETE
- 404 and invalid payload testing
- Login and protected endpoint validation
- Invalid credentials
- Missing fields
- Tampered token scenarios
- Zod response contract validation

### API + UI Integration

- Authenticate through API
- Create booking through API
- Inject token into browser cookie
- Verify booking in Admin UI
- Clean up booking through API with `finally`

### Network Mocking

- Intercept browser API requests with `page.route()`
- Return mocked JSON responses with `route.fulfill()`
- Validate UI behavior with mocked API data
- Mock HTTP 500 responses
- Validate UI fallback and error handling

---

## Project Structure

```text
ai-agents/
├── agents/          AI Planner, Generator, and Analyzer agents
├── requirements/    Sample software requirements
├── runners/         Playwright execution layer
├── types/           Shared workflow types
├── utils/           Run context and framework context utilities
└── runs/            Runtime artifacts (excluded from Git)

config/               Environment configuration
fixtures/             Custom Playwright fixtures
helpers/              Reusable utilities and business flows
pages/                Page Object Model
schemas/              API schemas
test-data/            Reusable test data
tests/ui/             UI tests
tests/api/            API tests
tests/integration/    Integration tests
tests/setup/          Authentication setup
```

---

## Running the Project

Install dependencies:

```bash
npm install
```

Create a local `.env` file based on:

```text
.env.example
```

Run the regular Playwright test suite:

```bash
npx playwright test
```

Run the AI QA Agent workflow:

```bash
npx tsx ai-agents/orchestrator.ts
```

The AI workflow requires an OpenAI API key configured through the local environment.

---

## Security

Secrets and local credentials are stored in `.env` and are excluded from Git.

Runtime AI artifacts under:

```text
ai-agents/runs/
```

are also excluded from Git because they may contain generated code, execution logs, or environment-specific information.

Only placeholder configuration should be committed in `.env.example`.

---

## Planned Enhancement

### Optional Remediation Workflow

A controlled **Healer Agent** is planned as a separate, optional remediation workflow.

The core QA workflow ends after execution analysis. A failed test does **not** automatically trigger AI code modification.

The remediation workflow will be explicitly invoked when needed and will initially be restricted to repairing AI-generated tests without modifying the existing automation framework.

---

## Author

**Si Wei Wang**  
QA Automation Engineer | QA Leadership

GitHub: https://github.com/siwei-wang-qa  
LinkedIn: https://www.linkedin.com/in/si-wei-wang-1432483a

Personal QA automation portfolio project demonstrating hands-on experience with Playwright, TypeScript, API testing, integration testing, CI, and AI-assisted QA automation.