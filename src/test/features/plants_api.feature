@api
Feature: Plant Management - API Test Cases 

  Background:
    Given the API base URL is "http://localhost:8080"


  Scenario: Admin: List all plants
    Given admin is authenticated with a valid token
    And at least one plant record exists
    When admin sends GET request to "/api/plants"
    Then the response status code should be 200
    And the response should contain list of all plants

  Scenario: Admin: Search plant by name
    Given admin is authenticated with a valid token
    And plant records exist with known plant names
    When admin sends GET request to "/api/plants?search=Rose"
    Then the response status code should be 200
    And only matching plant records should be returned

 
  Scenario: Admin: Filter plants by category
    Given admin is authenticated with a valid token
    And at least one category with associated plants exists
    When admin sends GET request to "/api/plants/category/1"
    Then the response status code should be 200
    And plants under selected category should be shown


  Scenario: Admin: View low stock plants
    Given admin is authenticated with a valid token
    And low stock plants exist
    When admin sends GET request to "/api/plants/summary"
    Then the response status code should be 200
    And low stock plants should be displayed

  
  Scenario: Admin: View plants using pagination and sorting
    Given admin is authenticated with a valid token
    And plants exist with varying stock levels including low-stock plants
    When admin sends GET request to "/api/plants/paged?page=0&size=5&sort=name"
    Then the response status code should be 200
    And plant list should be sorted by name in ascending order

  
  Scenario: User: List all plants
    Given user is authenticated with a valid token
    And plant records exist in the system
    When user sends GET request to "/api/plants"
    Then the response status code should be 200
    And plant list should be returned

  
  Scenario: User: Search plant
    Given user is authenticated with a valid token
    And plant records exist with searchable plant names
    When user sends GET request to "/api/plants?search=Lily"
    Then the response status code should be 200
    And matching plants should be shown

  
  Scenario: User: Filter plants by category
    Given user is authenticated with a valid token
    And categories with associated plants exist
    When user sends GET request to "/api/plants/category/2"
    Then the response status code should be 200
    And category-specific plants should be displayed

  
  Scenario: User: View plant summary
    Given user is authenticated with a valid token
    And plant summary data is available
    When user sends GET request to "/api/plants/summary"
    Then the response status code should be 200
    And total plants and low stock info should be shown

  
  Scenario: User: Restrict stock modification
    Given user is authenticated with a valid token
    And user role does not have permission to modify plant stock
    When user sends PUT request to "/api/plants/1" with stock update
    Then the response status code should be 403