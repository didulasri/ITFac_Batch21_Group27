@api @sales-api
Feature: Sales Management - API Test Cases

  Background:
    Given the API base URL is "http://localhost:8080"

  @SM-API-001
  Scenario: Admin create sale
    Given admin is authenticated with a valid token
    And a plant exists for sale creation
    When admin sends POST request to create sale for the plant with quantity 1
    Then the response status code should be 201
    And the sale should be created successfully

  @SM-API-002
  Scenario: Admin delete sale
    Given admin is authenticated with a valid token
    And a sale exists in the system for API
    When admin sends DELETE request to delete the sale
    Then the response status code should be 204

  @SM-API-003
  Scenario: Validation (Invalid Quantity)
    Given admin is authenticated with a valid token
    And a plant exists for sale creation
    When admin sends POST request to create sale for the plant with quantity 0
    Then the response status code should be 400
    And the response should contain error message "Quantity must be greater than 0"

  @SM-API-004
  Scenario: 404 Plant Not Found
    Given admin is authenticated with a valid token
    When admin sends POST request to create sale for plant "{nonExistentPlantId}" with quantity 1
    Then the response status code should be 404

  @SM-API-005
  Scenario: 404 Sale Not Found
    Given admin is authenticated with a valid token
    When admin sends DELETE request to "/api/sales/{nonExistentSaleId}"
    Then the response status code should be 404

  @SM-API-006
  Scenario: User get all sales
    Given user is authenticated with a valid token
    And at least one sale exists in the system
    When user sends GET request to "/api/sales"
    Then the response status code should be 200
    And the response should contain all sales

  @SM-API-007
  Scenario: User get sale by ID
    Given user is authenticated with a valid token
    And a sale exists in the system for API
    When user sends GET request to get the sale by ID
    Then the response status code should be 200
    And the response should contain the sale details

  @SM-API-008
  Scenario: User create forbidden
    Given user is authenticated with a valid token
    And a plant exists for sale creation
    When user sends POST request to create sale for the plant
    Then the response status code should be 403

  @SM-API-009
  Scenario: User delete forbidden
    Given user is authenticated with a valid token
    And a sale exists in the system for API
    When user sends DELETE request to delete the sale
    Then the response status code should be 403

  @SM-API-010
  Scenario: User get paginated sales
    Given user is authenticated with a valid token
    And multiple sales exist in the system
    When user sends GET request to "/api/sales/page?page=0&size=5"
    Then the response status code should be 200
    And the response should contain paginated sales with 5 items per page
