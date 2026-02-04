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
npx cucumber-js --tags @ui

# Sales Management UI tests
npx cucumber-js src/test/features/sales_ui.feature --tags @sales-ui

# Specific test by ID
npx cucumber-js --tags @SM-UI-001
```

### Run API Tests Only

```bash
# All API tests
npx cucumber-js --tags @api

# Sales Management API tests
npx cucumber-js --tags @sales-api
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

### Sales Management UI Tests (10 scenarios)

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
