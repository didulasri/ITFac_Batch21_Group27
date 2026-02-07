# Test Suite Documentation

## Overview

This directory contains automated tests for the QA Training Application using **Playwright** with **Cucumber (BDD)** and **TypeScript**. The test suite includes both UI and API tests following the Page Object Model pattern.

## Prerequisites

### Required Software

1. **Node.js** (v16 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **Java Runtime Environment (JRE)** (v11 or higher)
   - Required to run the QA Training Application
   - Download from [oracle.com/java](https://www.oracle.com/java/technologies/downloads/)
   - Verify installation: `java --version`

3. **Git** (optional, for version control)
   - Download from [git-scm.com](https://git-scm.com/)

### Application Under Test

The QA Training Application must be running before executing tests:

```bash
# Navigate to the application directory
cd "c:\Povindu\Dev\Misc\ITQA Project"

# Start the application
java -jar qa-training-app.jar
```

The application will be available at: `http://localhost:8080`

## Installation

1. **Install Dependencies**

```bash
# Navigate to the project directory
cd ITFac_Batch21_Group27

# Install all required packages
npm install
```

This will install:

- `@cucumber/cucumber` - BDD test framework
- `@playwright/test` - Browser automation
- `allure-cucumberjs` - Test reporting
- `typescript` - Type safety
- `ts-node` - TypeScript execution

2. **Install Playwright Browsers** (First time only)

```bash
npx playwright install
```

## Project Structure

```
src/test/
├── features/          # Cucumber feature files (BDD scenarios)
│   ├── sales_ui.feature
│   └── ...
├── pages/            # Page Object Models
│   ├── LoginPage.ts
│   ├── SalesPage.ts
│   └── ...
├── steps/            # Step definitions
│   ├── salesUiSteps.ts
│   └── ...
└── utils/            # Helper utilities and hooks
    └── hooks.ts
```

## Test Credentials

### Admin User

- **Username**: `admin`
- **Password**: `admin123`

### Regular User

- **Username**: `testuser`
- **Password**: `test123`

## Running Tests

### Run All Tests

```bash
npx cucumber-js
```

### Run UI Tests Only

```bash
# All UI tests
npx cucumber-js --tags "@ui"

# Sales Management UI tests
npx cucumber-js src/test/features/sales_ui.feature --tags "@sales-ui"

# Specific test by ID
npx cucumber-js --tags "@SM-UI-001"
```

### Run API Tests Only

```bash
# All API tests
npx cucumber-js --tags "@api"

# Sales Management API tests
npx cucumber-js --tags "@sales-api"
```

### Run Tests with JSON Report

```bash
npx cucumber-js --format json:report.json
```

### Run Tests with Allure Report

```bash
# Run tests with Allure formatter
npx cucumber-js --format allure-cucumberjs

# Generate and open Allure report
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report
```

## Test Tags

Tests are organized using Cucumber tags:

| Tag                            | Description                     |
| ------------------------------ | ------------------------------- |
| `@ui`                          | All UI tests                    |
| `@api`                         | All API tests                   |
| `@sales-ui`                    | Sales Management UI tests       |
| `@sales-api`                   | Sales Management API tests      |
| `@SM-UI-001` to `@SM-UI-010`   | Individual Sales UI test cases  |
| `@SM-API-001` to `@SM-API-010` | Individual Sales API test cases |

## Test Scenarios

### Category Management UI (CM1 - Listing & Search)

| ID         | Scenario                                          | Level | Status     |
| ---------- | ------------------------------------------------- | ----- | ---------- |
| CM1-UI-001 | Admin views category listing                      | UI    | ✅ Passing |
| CM1-UI-002 | Admin searches categories by name                 | UI    | ✅ Passing |
| CM1-UI-003 | Admin filters categories by parent category       | UI    | ✅ Passing |
| CM1-UI-004 | Admin sorts categories by ID, Name and Parent     | UI    | ✅ Passing |
| CM1-UI-005 | Admin paginates category listing                  | UI    | ✅ Passing |
| CM1-UI-006 | User views category listing (read-only)           | UI    | ✅ Passing |
| CM1-UI-007 | User searches categories by name                  | UI    | ✅ Passing |
| CM1-UI-008 | User filters categories by parent category        | UI    | ✅ Passing |
| CM1-UI-009 | User cannot see admin controls on categories page | UI    | ✅ Passing |
| CM1-UI-010 | User is blocked from admin-only category pages    | UI    | ✅ Passing |

### Category Management UI (CM2 - CRUD)

| ID         | Scenario                                                 | Level | Status     |
| ---------- | -------------------------------------------------------- | ----- | ---------- |
| CM2-UI-001 | Admin: Open Add Category page                            | UI    | ✅ Passing |
| CM2-UI-002 | Admin: Create main category (no parent)                  | UI    | ✅ Passing |
| CM2-UI-003 | Admin: Create sub-category with parent selected          | UI    | ✅ Passing |
| CM2-UI-004 | Admin: Validation - Category name required               | UI    | ✅ Passing |
| CM2-UI-005 | Admin: Validation - name length 3-10 + Cancel navigation | UI    | ✅ Passing |
| CM2-UI-006 | User: Add Category not visible                           | UI    | ✅ Passing |
| CM2-UI-007 | User: Edit/Delete actions hidden or disabled             | UI    | ✅ Passing |
| CM2-UI-008 | User: Direct access to Add page blocked                  | UI    | ✅ Passing |
| CM2-UI-009 | User: Direct access to Edit page blocked                 | UI    | ✅ Passing |
| CM2-UI-010 | User: Attempting delete via request is blocked           | UI    | ✅ Passing |

### Category Management API (CM1 - Listing & Search)

| ID         | Scenario                                    | Level | Method | Status     |
| ---------- | ------------------------------------------- | ----- | ------ | ---------- |
| CM1-API-01 | Admin: GET categories page default          | API   | GET    | ✅ Passing |
| CM1-API-02 | Admin: GET categories page search by name   | API   | GET    | ✅ Passing |
| CM1-API-03 | Admin: GET categories page filter by parent | API   | GET    | ✅ Passing |
| CM1-API-04 | Admin: GET category by id success           | API   | GET    | ✅ Passing |
| CM1-API-05 | Admin: Pagination endpoint rejects invalid  | API   | GET    | ✅ Passing |
| CM1-API-06 | User: GET categories allowed                | API   | GET    | ✅ Passing |
| CM1-API-07 | User: GET categories page allowed           | API   | GET    | ✅ Passing |
| CM1-API-08 | User: GET category by id allowed            | API   | GET    | ✅ Passing |
| CM1-API-09 | User: GET summary allowed                   | API   | GET    | ✅ Passing |
| CM1-API-10 | User: GET sub-categories allowed            | API   | GET    | ✅ Passing |

### Category Management API (CM2 - CRUD)

| ID         | Scenario                                    | Level | Method | Status     |
| ---------- | ------------------------------------------- | ----- | ------ | ---------- |
| CM2-API-01 | Admin: POST create main category success    | API   | POST   | ✅ Passing |
| CM2-API-02 | Admin: POST create sub-category success     | API   | POST   | ✅ Passing |
| CM2-API-03 | Admin: POST validation - missing/blank name | API   | POST   | ✅ Passing |
| CM2-API-04 | Admin: PUT update category success          | API   | PUT    | ✅ Passing |
| CM2-API-05 | Admin: DELETE category success + verify     | API   | DELETE | ✅ Passing |
| CM2-API-06 | User: POST create category forbidden        | API   | POST   | ✅ Passing |
| CM2-API-07 | User: PUT update category forbidden         | API   | PUT    | ✅ Passing |
| CM2-API-08 | User: DELETE category forbidden             | API   | DELETE | ✅ Passing |
| CM2-API-09 | Unauthorized: POST create returns 401       | API   | POST   | ✅ Passing |
| CM2-API-10 | Unauthorized: PUT update returns 401        | API   | PUT    | ✅ Passing |

### Plant Management UI (PM1 - Listing & Search)

| ID         | Scenario                                   | Level | Status     |
| ---------- | ------------------------------------------ | ----- | ---------- |
| PM1-UI-001 | Admin views plant listing                  | UI    | ✅ Passing |
| PM1-UI-002 | Admin searches plants by name              | UI    | ✅ Passing |
| PM1-UI-003 | Admin filters plants by category           | UI    | ✅ Passing |
| PM1-UI-004 | Admin views low stock plants               | UI    | ✅ Passing |
| PM1-UI-005 | Admin can see action buttons on plant list | UI    | ✅ Passing |
| PM1-UI-006 | User views plant listing                   | UI    | ✅ Passing |
| PM1-UI-007 | User searches plants by name               | UI    | ✅ Passing |
| PM1-UI-008 | User filters plants by category            | UI    | ✅ Passing |
| PM1-UI-009 | User views low stock indicator             | UI    | ✅ Passing |
| PM1-UI-010 | User cannot access admin controls          | UI    | ✅ Passing |

### Plant Management UI (PM2 - CRUD)

| ID         | Scenario                                           | Level | Status     |
| ---------- | -------------------------------------------------- | ----- | ---------- |
| PM2-UI-001 | Admin Create a new plant with valid data           | UI    | ✅ Passing |
| PM2-UI-002 | Admin Validate required fields when creating plant | UI    | ✅ Passing |
| PM2-UI-003 | Admin Update existing plant details                | UI    | ✅ Passing |
| PM2-UI-004 | Admin Delete a plant                               | UI    | ✅ Passing |
| PM2-UI-005 | Admin Prevent negative quantity input              | UI    | ✅ Passing |
| PM2-UI-006 | User View plant list                               | UI    | ✅ Passing |
| PM2-UI-007 | User Verify Add Plant button is hidden             | UI    | ✅ Passing |
| PM2-UI-008 | User Verify Edit option is disabled                | UI    | ✅ Passing |
| PM2-UI-009 | User Verify Delete option is hidden                | UI    | ✅ Passing |
| PM2-UI-010 | User View plant details                            | UI    | ✅ Passing |

### Plant Management API (PM1 - Listing & Search)

| ID         | Scenario                                    | Level | Method | Status     |
| ---------- | ------------------------------------------- | ----- | ------ | ---------- |
| PM1-API-01 | Admin: List all plants                      | API   | GET    | ✅ Passing |
| PM1-API-02 | Admin: Search plant by name                 | API   | GET    | ✅ Passing |
| PM1-API-03 | Admin: Filter plants by category            | API   | GET    | ✅ Passing |
| PM1-API-04 | Admin: View low stock plants                | API   | GET    | ✅ Passing |
| PM1-API-05 | Admin: View plants using pagination/sorting | API   | GET    | ✅ Passing |
| PM1-API-06 | User: List all plants                       | API   | GET    | ✅ Passing |
| PM1-API-07 | User: Search plant                          | API   | GET    | ✅ Passing |
| PM1-API-08 | User: Filter plants by category             | API   | GET    | ✅ Passing |
| PM1-API-09 | User: View plant summary                    | API   | GET    | ✅ Passing |
| PM1-API-10 | User: Restrict stock modification           | API   | PUT    | ✅ Passing |

### Plant Management API (PM2 - CRUD)

| ID         | Scenario                                      | Level | Method | Status     |
| ---------- | --------------------------------------------- | ----- | ------ | ---------- |
| PM2-API-01 | Admin Create new plant with valid data        | API   | POST   | ✅ Passing |
| PM2-API-02 | Admin Validate plant creation, missing fields | API   | POST   | ✅ Passing |
| PM2-API-03 | Admin Update existing plant                   | API   | PUT    | ✅ Passing |
| PM2-API-04 | Admin Delete a plant                          | API   | DELETE | ✅ Passing |
| PM2-API-05 | Admin Prevent negative stock value            | API   | POST   | ✅ Passing |
| PM2-API-06 | User Prevent plant creation by user           | API   | POST   | ✅ Passing |
| PM2-API-07 | User Prevent plant update by user             | API   | PUT    | ✅ Passing |
| PM2-API-08 | User Prevent plant deletion by user           | API   | DELETE | ✅ Passing |
| PM2-API-09 | User View plant details                       | API   | GET    | ✅ Passing |
| PM2-API-10 | User Prevent invalid update attempt           | API   | PUT    | ✅ Passing |

### Sales Management UI (10 scenarios)

| ID        | Scenario                      | Status     |
| --------- | ----------------------------- | ---------- |
| SM-UI-001 | Admin creates a sale          | ✅ Passing |
| SM-UI-002 | Validation (Invalid Qty)      | ✅ Passing |
| SM-UI-003 | Admin deletes sale            | ✅ Passing |
| SM-UI-004 | Cancel delete action          | ✅ Passing |
| SM-UI-005 | Verify Sell Button            | ✅ Passing |
| SM-UI-006 | User views Sales List         | ✅ Passing |
| SM-UI-007 | Sell Button Hidden for User   | ✅ Passing |
| SM-UI-008 | Delete Button Hidden for User | ✅ Passing |
| SM-UI-009 | Default Sorting               | ✅ Passing |
| SM-UI-010 | Direct Access Blocked         | ✅ Passing |

### Sales Management API (10 scenarios)

| ID         | Scenario                        | Method | Status     | Note                           |
| ---------- | ------------------------------- | ------ | ---------- | ------------------------------ |
| SM-API-001 | Admin create sale               | POST   | ✅ Passing |                                |
| SM-API-002 | Admin delete sale               | DELETE | ✅ Passing |                                |
| SM-API-003 | Validation (Insufficient Stock) | POST   | ✅ Passing | Returns 400 Bad Request        |
| SM-API-004 | Validation (Invalid Quantity)   | POST   | ✅ Passing | Returns 400 Bad Request        |
| SM-API-005 | Admin get all sales             | GET    | ✅ Passing |                                |
| SM-API-006 | User get all sales              | GET    | ✅ Passing |                                |
| SM-API-007 | User get sale by ID             | GET    | ✅ Passing |                                |
| SM-API-008 | User create forbidden           | POST   | ❌ Failing | **Bug:** Bypass (Expected 403) |
| SM-API-009 | User delete forbidden           | DELETE | ❌ Failing | **Bug:** Bypass (Expected 403) |
| SM-API-010 | Pagination check                | GET    | ✅ Passing | Verified Spring Page structure |

## Running API Tests

The API tests can be executed individually or as a suite using dedicated Cucumber profiles:

```bash
# Run all Sales API scenarios using the profile
npx cucumber-js --profile sales-api

# Run using tags
npx cucumber-js --tags @sales-api

# Run a specific API test case
npx cucumber-js --tags @SM-API-001
```

### API Test Data Setup

API tests implement **Robust Data Seeding**. They automatically initialize the required hierarchy:
`Main Category -> Sub-Category -> Plant`
This ensures tests are isolated and independent of the current database state. Preconditions are handled using administrative privileges (token swapping).

## Troubleshooting

### Common Issues

1. **Application not running**

   ```
   Error: connect ECONNREFUSED 127.0.0.1:8080
   ```

   **Solution**: Start the QA Training Application first (`java -jar qa-training-app.jar`)

2. **Browser not found**

   ```
   Error: Executable doesn't exist at ...
   ```

   **Solution**: Install Playwright browsers (`npx playwright install`)

3. **Test data missing**

   ```
   Error: Plant 'White Rose' not found in dropdown
   ```

   **Solution**: Ensure test data exists in the application (create Category → Sub-category → Plant)

4. **Port already in use**
   ```
   Error: Address already in use :::8080
   ```
   **Solution**: Stop any other process using port 8080 or change the application port

### Debug Mode

Run tests in headed mode (visible browser) for debugging:

```bash
# Set environment variable
$env:HEADED="true"  # PowerShell
set HEADED=true     # CMD

# Run tests
npx cucumber-js --tags @sales-ui
```

## Configuration Files

- **`cucumber.js`** - Cucumber configuration and profiles
- **`playwright.config.ts`** - Playwright browser settings
- **`tsconfig.json`** - TypeScript compiler options

## Best Practices

1. **Always start the application before running tests**
2. **Run tests in isolation** - Each test should be independent
3. **Use tags** - Run specific test suites instead of all tests
4. **Check test data** - Ensure required data exists before running tests
5. **Review reports** - Check JSON/Allure reports for detailed failure analysis

## Support

For issues or questions:

1. Check the test output and error messages
2. Review the JSON report for detailed step-by-step execution
3. Verify application is running and accessible at `http://localhost:8080`
4. Ensure all prerequisites are installed correctly

## Additional Resources

- [Cucumber Documentation](https://cucumber.io/docs/cucumber/)
- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Allure Report Documentation](https://docs.qameta.io/allure/)
