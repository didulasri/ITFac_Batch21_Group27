@api
Feature: Plant Management - API Test Cases (PM1-API-01 to PM1-API-10)

  Background:
    Given the API base URL is "http://localhost:8080"

  # PM1-API-01
  Scenario: PM1-API-01 - Admin: List all plants
    Given admin is authenticated with a valid token
    And at least one plant record exists
    When admin sends GET request to "/api/plants"
    Then the response status code should be 200
    And the response should contain list of all plants

  # PM1-API-02
  Scenario: PM1-API-02 - Admin: Search plant by name
    Given admin is authenticated with a valid token
    And plant records exist with known plant names
    When admin sends GET request to "/api/plants?search=Rose"
    Then the response status code should be 200
    And only matching plant records should be returned

  # PM1-API-03
  Scenario: PM1-API-03 - Admin: Filter plants by category
    Given admin is authenticated with a valid token
    And at least one category with associated plants exists
    When admin sends GET request to "/api/plants/category/1"
    Then the response status code should be 200
    And plants under selected category should be shown

  # PM1-API-04
  Scenario: PM1-API-04 - Admin: View low stock plants
    Given admin is authenticated with a valid token
    And low stock plants exist
    When admin sends GET request to "/api/plants/summary"
    Then the response status code should be 200
    And low stock plants should be displayed

  # PM1-API-05
  Scenario: PM1-API-05 - Admin: View plants using pagination and sorting
    Given admin is authenticated with a valid token
    And plants exist with varying stock levels including low-stock plants
    When admin sends GET request to "/api/plants/paged?page=0&size=5&sort=name"
    Then the response status code should be 200
    And plant list should be sorted by name in ascending order

  # PM1-API-06
  Scenario: PM1-API-06 - User: List all plants
    Given user is authenticated with a valid token
    And plant records exist in the system
    When user sends GET request to "/api/plants"
    Then the response status code should be 200
    And plant list should be returned

  # PM1-API-07
  Scenario: PM1-API-07 - User: Search plant
    Given user is authenticated with a valid token
    And plant records exist with searchable plant names
    When user sends GET request to "/api/plants?search=Lily"
    Then the response status code should be 200
    And matching plants should be shown

  # PM1-API-08
  Scenario: PM1-API-08 - User: Filter plants by category
    Given user is authenticated with a valid token
    And categories with associated plants exist
    When user sends GET request to "/api/plants/category/2"
    Then the response status code should be 200
    And category-specific plants should be displayed

  # PM1-API-09
  Scenario: PM1-API-09 - User: View plant summary
    Given user is authenticated with a valid token
    And plant summary data is available
    When user sends GET request to "/api/plants/summary"
    Then the response status code should be 200
    And total plants and low stock info should be shown

  # PM1-API-10
  Scenario: PM1-API-10 - User: Restrict stock modification
    Given user is authenticated with a valid token
    And user role does not have permission to modify plant stock
    When user sends PUT request to "/api/plants/1" with stock update
    Then the response status code should be 403