# OrangeHRM PIM UI tests

[![Tests](https://github.com/mops123/orangehrm-pim-automation/actions/workflows/tests.yml/badge.svg)](https://github.com/mops123/orangehrm-pim-automation/actions/workflows/tests.yml)

UI tests for the PIM module of the [OrangeHRM demo](https://opensource-demo.orangehrmlive.com/), written with Playwright Test and TypeScript.

## What is covered

| Spec                                        | Tests                                                                                                                | Tag                     |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `tests/pim/employee-lifecycle.spec.ts`      | Create an employee → find by ID → open details → edit name and personal details → check after reload and in the list | `@smoke`                |
| `tests/auth/login.spec.ts`                  | Valid login; wrong password; empty fields                                                                            | `@smoke`, `@regression` |
| `tests/pim/add-employee-validation.spec.ts` | Required names (empty and whitespace); length limits; duplicate Employee Id (same and different case)                | `@regression`           |
| `tests/pim/delete-employee.spec.ts`         | Delete an employee; cancel deletion                                                                                  | `@regression`           |
| `tests/pim/search-employee.spec.ts`         | No results by ID and by name; Reset clears filters                                                                   | `@regression`           |

Why these extra scenarios: validation, deletion and search are the first places where a PIM regression would hurt real users (bad data saved, a record lost by mistake, an employee that can't be found). Exploring deletion and search is also where I found the defects described in [Issues found](#issues-found).

## Running

Requires Node 22 (`.nvmrc`).

```bash
nvm use
npm ci
npx playwright install chromium
npm test
```

No `.env` is needed for the public demo: the URL and the demo credentials are defaults in `src/config/env.ts`. To run against another instance, copy `.env.example` to `.env` and change the values.

| Script                                      |                                        |
| ------------------------------------------- | -------------------------------------- |
| `npm test`                                  | all tests                              |
| `npm run test:smoke` / `test:regression`    | by tag                                 |
| `npm run test:headed` / `test:ui`           | watch the browser / Playwright UI mode |
| `npm run report`                            | open the last HTML report              |
| `npm run typecheck`, `lint`, `format:check` | static checks (also run in CI)         |

## Structure

```
src/
  components/  OrangeHRM widgets: inputGroup, Select, Autocomplete, DataTable, Toast, ConfirmDialog, Sidebar
  pages/       page objects built from the components
  api/         EmployeesApi – create/delete employees over REST for test setup and cleanup
  fixtures/    custom `test` with page objects, `createdEmployee` and `deleteAfterTest`
  data/        test data factory (faker)
  config/      env with defaults
tests/
  auth.setup.ts  logs in once and saves the session
  auth/, pim/    specs
```

## Design decisions

**Layers.** Components wrap the custom OrangeHRM widgets (its selects and autocompletes are not native elements), page objects combine them into screens, fixtures hand them to tests. A new screen is usually a page object reusing existing components; a new test only asks for the fixtures it needs. Assertions stay in tests; page objects only perform actions and wait until they are done.

**Locators.** Roles and placeholders where possible. OrangeHRM labels are not linked to their inputs, so `getByLabel` doesn't work; `inputGroup(scope, label)` finds a field by the label text inside its group. Table cells are read by column header, not by index.

**Waiting.** No fixed sleeps. Actions that trigger a request wait for the response: after Search the table briefly shows old rows, and a toast lives about 3 seconds, so `save()` returns as soon as the API answers. The employee details form renders empty before its loader appears, so the page waits for the data itself, not just for the loader.

**Test data.** The demo is shared and gets reset, so every test creates its own data and removes it. Names and Employee Ids are generated (`QA` + 8 digits; the auto-suggested ID collided between parallel workers). Employees that a test only needs as a precondition are created through the REST API, which is faster and keeps the test focused on what it checks. Cleanup lives in the fixture teardown, so it runs even when a test fails. Dates are ISO in the data and converted in the page object, because the date fields on the demo use `yyyy-dd-mm`.

**Session.** A setup project logs in through the UI once and stores the session cookie; the other tests start logged in. Login itself is covered by its own tests, which start without a session.

**Reporting.** Locally `list` + HTML. In CI also the `github` reporter for annotations. Trace and video are kept on the first retry, screenshots on failure.

**CI.** GitHub Actions runs lint and e2e jobs in parallel on every push to `main` and on pull requests, with 2 retries (for the shared demo and network, not for flaky tests). The HTML report with traces is uploaded as an artifact for 7 days.

**Stability check.** The full suite was run with `--repeat-each` on 2, 4 and 8 workers without retries: 157 runs, no failures, no test data left on the demo afterwards.

## Issues found

1. **Records counter is not updated when the list request fails.** Filter by name using the autocomplete suggestion → delete that employee → the table is empty but the header still says "(1) Record Found". The list reload sends `empNumber` of the deleted employee and gets `422`. The same happens when searching by an Employee Id longer than 10 characters: error toast "Invalid Parameter", empty table, old counter.
2. **No length validation on the Employee Id search field**, unlike the Add Employee form (max 10); the request is sent and rejected by the API (see above).

The deletion test does not depend on issue 1: it checks an empty table and then searches again by ID.

## What I would add next

- API tests for server-side rules: the duplicate Employee Id check happens in the browser, so a direct POST is not covered by UI tests.
- Run smoke on every PR and the full suite on a schedule once it grows; shard with `--shard` in a matrix.
- Firefox and WebKit projects.
- Publish the HTML report to GitHub Pages instead of a downloadable artifact.
- A scheduled cleanup of `QA`-prefixed employees in case a run is interrupted between creating an employee and its teardown.
