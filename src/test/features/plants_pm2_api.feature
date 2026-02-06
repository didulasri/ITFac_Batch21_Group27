@PM2-API
@api
@PM2

Feature: Plant Management PM2 - CRUD Operations and Valiations

# API TEST CASES - ADMIN

@PM2-API-01
Scenario: PM2-API-01 - Admin Create new plant with valid data
    Given the user is authenticated as Admin with a valid access token
    When the admin sends a POST request to "/api/plants/category/{categoryId}" with valid plant data:
      | field    | value         |
      | name     | Anthurium         |
      | category | Flowers       |
      | price    | 15.99         |
      | quantity | 100           |
    Then the API should return HTTP 201 and the plant should be created successfully

@PM2-API-02
Scenario: PM2-API-02 - Admin Validate plant creation with missing fields
    Given the user is authenticated as Admin with a valid access token
    When the admin sends a POST request to "/api/plants" without the plant name field
    Then the API should return HTTP 400 with an appropriate validation error message

@PM2-API-03
Scenario: PM2-API-03 - Admin Update existing plant
    Given the user is authenticated as Admin with a valid access token
    And there is at least one plant record in the system
    When the admin sends a PUT request to "/api/plants/{id}" with updated plant data:
      | field | value       |
      | name  | Updated Name |
      | price | 500       |
    Then the API should return HTTP 200 and the plant details should be updated successfully

@PM2-API-04
Scenario: PM2-API-04 - Admin Delete a plant
    Given the user is authenticated as Admin with a valid access token
    And there is at least one plant record in the system
    When the admin sends a DELETE request to "/api/plants/{id}"
    Then the API should return HTTP 200 or 204 and the plant should be deleted successfully

@PM2-API-05
Scenario: PM2-API-05 - Admin Prevent negative stock value
    Given the user is authenticated as Admin with a valid access token
    When the admin sends a POST request to "/api/plants" with negative quantity "-50"
    Then the API should return HTTP 400 with a validation error for negative quantity

# API TEST CASES - ADMIN

@PM2-API-06
Scenario: PM2-API-06 - User Prevent plant creation by user
    Given the user is authenticated as User with a valid access token
    When the user sends a POST request to "/api/plants" with plant data
    Then the API should return HTTP 403 indicating access is denied

@PM2-API-07
Scenario: PM2-API-07 - User Prevent plant update by user
    Given the user is authenticated as User with a valid access token
    And there is at least one plant record in the system
    When the user sends a PUT request to "/api/plants/{id}" with updated data
    Then the API should return HTTP 403 indicating update is not allowed

@PM2-API-08
Scenario: PM2-API-08 - User Prevent plant deletion by user
    Given the user is authenticated as User with a valid access token
    And there is at least one plant record in the system
    When the user sends a DELETE request to "/api/plants/{id}"
    Then the API should return HTTP 403 indicating delete action is forbidden

@PM2-API-09
Scenario: PM2-API-09 - User View plant details
    Given the user is authenticated as User with a valid access token
    And there is at least one plant record in the system
    When the user sends a GET request to "/api/plants/{id}"
    Then the API should return HTTP 200 and the plant data should be retrieved successfully

@PM2-API-10
Scenario: PM2-API-10 - User Prevent invalid update attempt
    Given the user is authenticated as User with a valid access token
    And there is at least one plant record in the system
    When the user sends a PUT request to "/api/plants/{id}" with updated quantity
    Then the API should return HTTP 403 and the update operation should be rejected
