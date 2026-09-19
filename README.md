# Playwright QA Automation Framework

A hands-on QA automation project built with **Playwright** and **TypeScript**.

This is an ongoing personal skill-refresh project created during a career transition to stay hands-on with modern QA automation practices and to demonstrate practical framework design for real-world web testing.

The project focuses not only on writing test cases, but also on building a maintainable automation framework with reusable page objects, fixtures, authentication state, environment configuration, CI/CD integration, and reporting.

---

## Tech Stack

- Playwright
- TypeScript
- Node.js
- GitHub Actions
- dotenv
- HTML Reporter

---

## Key Features

- Page Object Model
- Custom Playwright Fixtures
- Data-Driven Testing
- Authentication State with `storageState`
- Environment Variable Management
- Centralized Environment Configuration
- GitHub Actions CI Integration
- Test Tags such as `@smoke` and `@regression`
- `test.step()` for readable test flows
- Retry Configuration
- Screenshots on Failure
- Video Retention on Failure
- Trace Collection
- HTML Test Reports
- Test Isolation
- Project-Based Test Configuration

---

## Project Structure

```text
playwright-qa-automation-framework/
├── .github/
│   └── workflows/
│       └── playwright.yml
│
├── config/
│   └── env.ts
│
├── fixtures/
│   └── testFixtures.ts
│
├── pages/
│   ├── LoginPage.ts
│   ├── ProductsPage.ts
│   └── CartPage.ts
│
├── playwright/
│   └── .auth/
│       └── user.json
│
├── test-data/
│   └── users.ts
│
├── tests/
│   ├── auth.setup.ts
│   ├── login.spec.ts
│   └── products.spec.ts
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── playwright.config.ts
└── README.md