# Playwright QA Automation Framework

A practical **Playwright + TypeScript** QA automation project focused on maintainable framework design, realistic end-to-end testing, API validation, and CI integration.

## Highlights

- Playwright + TypeScript with Page Object Model and custom fixtures
- Reusable authentication with `storageState`
- Data-driven testing and centralized test data
- Full UI checkout flow with multi-item and remove-item scenarios
- Price, tax, and total calculation validation
- PDF download and file validation
- API testing with GET, POST, PATCH, and DELETE
- Positive and negative API scenarios
- Separate UI, API, and setup test projects
- GitHub Actions CI/CD with QA/Staging environments and Secrets

## Automated Flows

### UI

- Valid and invalid login scenarios
- Product and cart operations
- Full checkout happy path
- Required-field validation
- Cancel checkout behavior
- Multi-item checkout
- Remove-item state validation through checkout
- Order completion
- PDF receipt download and file validation

### API

- Get product details by ID
- Create product with valid data
- Validate 404 response for a non-existent product
- Update a product field with PATCH
- Delete a product and validate deletion status
- Validate status codes, response bodies, data types, and business values

## Framework Structure

- `config/` → environment configuration
- `fixtures/` → reusable Playwright fixtures
- `helpers/` → reusable business flows
- `pages/` → Page Object Model
- `test-data/` → UI and API test data
- `tests/ui/` → browser UI tests
- `tests/api/` → API tests
- `tests/setup/` → authentication setup

## Environment Configuration

The project uses separate configuration for UI and API targets:

## Text
BASE_URL
API_BASE_URL
TEST_USERNAME
TEST_PASSWORD