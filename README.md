# Playwright QA Automation Framework

A practical **Playwright + TypeScript** automation project focused on UI testing, API testing, API + UI integration, reusable framework design, and CI.

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
- GitHub Actions CI
- QA / Staging environments
- Secrets-based configuration
- HTML reports and test artifacts

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

## Project Structure

```text
config/         Environment configuration
fixtures/       Custom Playwright fixtures
helpers/        Reusable business flows
pages/          Page Object Model
schemas/        API schemas
test-data/      Reusable test data
tests/ui/       UI tests
tests/api/      API tests
tests/integration/ Integration tests
tests/setup/    Authentication setup
```

## Author

**Si Wei Wang**
QA Automation Engineer | QA Leadership

GitHub: https://github.com/siwei-wang-qa
LinkedIn: https://www.linkedin.com/in/si-wei-wang-1432483a
Personal QA automation portfolio project demonstrating hands-on Playwright, TypeScript, API testing, integration testing, and CI skills.