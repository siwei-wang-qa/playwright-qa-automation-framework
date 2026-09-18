# Playwright QA Automation Framework

This repository is an ongoing personal QA automation project built with Playwright and TypeScript.

With a background in software QA and test automation, I created this project during a career transition to stay hands-on with modern automation practices, refresh key concepts, and continue strengthening my framework design skills.

The goal of this project is not simply to automate a few test cases, but to build and continuously improve a maintainable Playwright framework that reflects practical QA engineering patterns used in real-world environments.

## Current Focus

The project currently covers:

- Playwright with TypeScript
- Page Object Model (POM)
- Custom fixtures
- Fixture dependencies
- Data-driven testing
- Reusable test data
- Smoke and regression tagging
- Hard and soft assertions
- `test.step()` for readable test flows
- Retry strategy
- Flaky test investigation
- Trace, screenshot, and video diagnostics
- Test isolation
- Locator chaining and filtering
- Structured test setup with `beforeEach`
- Maintainable test organization

## Project Structure

```text
playwright-qa-automation-framework/
├── pages/
│   ├── LoginPage.ts
│   ├── productsPage.ts
│   └── CartPage.ts
│
├── fixtures/
│   └── testFixtures.ts
│
├── test-data/
│   └── users.ts
│
├── tests/
│   └── login.spec.ts
│
├── .github/
│   └── workflows/
│
├── playwright.config.ts
├── package.json
└── README.md