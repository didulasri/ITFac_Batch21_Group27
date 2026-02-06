# Allure Reporting Guide

This project is configured to use [Allure Framework](https://allurereport.org/) for generating comprehensive test reports. `allure-cucumberjs` is used to integrate Cucumber.js with Allure.

## Prerequisites

Ensure you have the Allure Commandline tool installed.
If you have Java installed, you can install it via NPM (which we've added to scripts) or use an external installation.
The project uses `allure-commandline` (via `allure-cucumberjs` dependencies usually, or strictly it should be installed).
(Note: The `allure` command in the scripts assumes `allure` is in the path or provided by `allure-commandline` package).

## Running Tests with Reporting

We have configured the following NPM scripts to check your tests:

### 1. Run automation tests
Run your usual test command. The report data will be automatically generated in the `allure-results` folder.

```bash
npm test
# or
npm run test:categories
# etc.
```

### 2. Generate and Open the Report
To generate the HTML report from the results and open it in your browser:

```bash
npm run allure:open
```

Or step-by-step:
```bash
npm run allure:generate  # Generates report to 'allure-report' folder
allure open allure-report # Opens the report (requires global allure or use npm script)
```

### 3. All-in-one Command
To run tests, generate the report, and open it immediately:

```bash
npm run test:allure
```

### 4. Cleaning Results
To clean up old results before a fresh run:

```bash
npm run allure:clean
```

## Configuration

The Allure configuration is located in `cucumber.js`.
Each profile enables the reporter:

```javascript
format: [
  "progress", 
  "allure-cucumberjs/reporter"
],
formatOptions: {
  resultsDir: "./allure-results"
}
```
