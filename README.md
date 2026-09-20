# Playwright QA Automation Framework

A practical **Playwright + TypeScript** QA automation project focused on maintainable framework design, realistic end-to-end testing, and CI integration.

## Highlights

- Playwright + TypeScript with Page Object Model and custom fixtures
- Reusable authentication with `storageState`
- Data-driven testing and centralized test data
- Full checkout flow including multi-item and remove-item scenarios
- Price, tax, and total calculation validation
- PDF download and file validation
- GitHub Actions CI/CD with QA/Staging environments and Secrets
- HTML reports, screenshots, video, and trace

## Automated Flows

The project currently covers:

- Valid and invalid login scenarios
- Product and cart operations
- Full checkout happy path
- Required-field validation
- Cancel checkout behavior
- Multi-item checkout
- Remove-item state validation through checkout
- Order completion
- PDF receipt download and file validation

## Framework Structure

- `config/` → environment configuration
- `fixtures/` → reusable Playwright fixtures
- `helpers/` → reusable business flows
- `pages/` → Page Object Model
- `test-data/` → test inputs and expected values
- `tests/` → business scenarios and assertions

## CI/CD

GitHub Actions automatically runs the Playwright suite with:

- QA / Staging environment selection
- GitHub Secrets
- Automated Playwright execution
- HTML test reports
- Downloadable test artifacts