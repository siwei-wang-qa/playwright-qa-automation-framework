# Playwright QA Automation Framework

A practical **Playwright + TypeScript** automation project focused on maintainable framework design, UI/API coverage, cross-layer validation, and CI integration.

## Highlights

- Playwright + TypeScript with Page Object Model and custom fixtures
- Reusable authentication with `storageState`
- Data-driven testing and centralized test data
- UI, API, setup, and integration test projects
- Full checkout flow with multi-item and remove-item scenarios
- Price, tax, and total calculation validation
- PDF download and file validation
- API CRUD and negative testing
- Token-based API authentication
- Zod response contract validation
- API + UI integration with API setup, UI verification, and API cleanup
- GitHub Actions CI with QA/Staging environments and Secrets

## Automated Flows

### UI

- Valid and invalid login scenarios
- Product and cart operations
- Full checkout happy path
- Required-field validation
- Cancel checkout behavior
- Multi-item checkout
- Remove-item validation through checkout
- Order completion
- PDF receipt download validation

### API

- GET, POST, PATCH, and DELETE product scenarios
- 404 and invalid payload validation
- Login and Bearer-token authentication
- Protected endpoint validation
- Invalid and tampered token scenarios
- Response contract validation with Zod

### API + UI Integration

- Authenticate through API
- Create booking test data through API
- Inject authentication token into the browser session
- Open the related Admin UI
- Verify the API-created booking in the UI
- Clean up the booking through API in `finally`

## Framework Structure

- `config/` → environment configuration
- `fixtures/` → reusable Playwright fixtures
- `helpers/` → reusable business flows
- `pages/` → Page Object Model
- `schemas/` → API response schemas
- `test-data/` → reusable UI/API test data
- `tests/ui/` → browser UI tests
- `tests/api/` → API tests
- `tests/integration/` → API + UI integration tests
- `tests/setup/` → authentication setup

## Environment Configuration

The framework uses separate UI, API, and integration environment configuration.

## text
BASE_URL
API_BASE_URL
BOOKER_UI_BASE_URL
BOOKER_API_BASE_URL
TEST_USERNAME
TEST_PASSWORD