@pm2

Feature: Plant Management PM2 - CRUD Operations with Role-Based Access Control

Background: QA Training Application is opened

# ===========================
# UI TEST CASES - ADMIN
# ===========================

Scenario: PM2-UI-01 - Admin Create a new plant with valid data
    Given the user is logged in as Admin
    When the admin opens the plants page
    And the admin clicks the Add Plant button
    And the admin enters plant details:
      | field    | value         |
      | name     | Tulip         |
      | category | Flowers       |
      | price    | 25.99         |
      | quantity | 50            |
    And the admin clicks the Save button
    Then the plant "Tulip" should be created successfully and appear in the plant list

Scenario: PM2-UI-02 - Admin Validate required fields when creating plant
    Given the user is logged in as Admin
    When the admin opens the plants page
    And the admin clicks the Add Plant button
    And the admin leaves all required fields empty
    And the admin clicks the Save button
    Then validation messages should be displayed for all required fields

Scenario: PM2-UI-03 - Admin Update existing plant details
    Given the user is logged in as Admin
    And there is at least one plant record in the system
    When the admin opens the plants page
    And the admin clicks the Edit button for the first plant
    And the admin modifies the plant name to "Updated Plant"
    And the admin modifies the plant price to "900"
    And the admin clicks the Save button
    Then the updated plant details should be saved successfully

Scenario: PM2-UI-04 - Admin Delete a plant
    Given the user is logged in as Admin
    And there is at least one plant record in the system
    When the admin opens the plants page
    And the admin clicks the Delete button for a plant
    And the admin confirms the deletion
    Then the selected plant should be deleted successfully and removed from the list

Scenario: PM2-UI-05 - Admin Prevent negative quantity input
    Given the user is logged in as Admin
    When the admin opens the plants page
    And the admin clicks the Add Plant button
    And the admin enters plant name "Rose"
    And the admin enters negative quantity "-10"
    And the admin clicks the Save button
    Then the system should prevent saving and display validation error for negative quantity

Scenario: PM2-UI-06 - User View plant list
    Given the user is logged in as User
    When the user opens the plants page
    Then the list of plants should be displayed with available plant records

Scenario: PM2-UI-07 - User Verify Add Plant button is hidden
    Given the user is logged in as User
    When the user opens the plants page
    Then the Add Plant button should not be visible to the user

Scenario: PM2-UI-08 - User Verify Edit option is disabled
    Given the user is logged in as User
    When the user opens the plants page
    And the user views the plant list
    Then the Edit option should be disabled or hidden for the user

Scenario: PM2-UI-09 - User Verify Delete option is hidden
    Given the user is logged in as User
    When the user opens the plants page
    Then the Delete option should not be visible to the user

Scenario: PM2-UI-10 - User View plant details
    Given the user is logged in as User
    And there is at least one plant record in the system
    When the user opens the plants page
    And the user selects a plant from the list
    Then the selected plant details should be displayed correctly

# ===========================
# API TEST CASES - ADMIN
# ===========================

Scenario: PM2-API-01 - Admin Create new plant with valid data
    Given the user is authenticated as Admin with a valid access token
    When the admin sends a POST request to "/api/plants" with valid plant data:
      | field    | value         |
      | name     | uniqueName         |
      | category | Flowers       |
      | price    | 15.99         |
      | quantity | 100           |
    Then the API should return HTTP 201 and the plant should be created successfully

Scenario: PM2-API-02 - Admin Validate plant creation with missing fields
    Given the user is authenticated as Admin with a valid access token
    When the admin sends a POST request to "/api/plants" without the plant name field
    Then the API should return HTTP 400 with an appropriate validation error message

Scenario: PM2-API-03 - Admin Update existing plant
    Given the user is authenticated as Admin with a valid access token
    And there is at least one plant record in the system
    When the admin sends a PUT request to "/api/plants/{id}" with updated plant data:
      | field | value       |
      | name  | Updated Name |
      | price | 500       |
    Then the API should return HTTP 200 and the plant details should be updated successfully

Scenario: PM2-API-04 - Admin Delete a plant
    Given the user is authenticated as Admin with a valid access token
    And there is at least one plant record in the system
    When the admin sends a DELETE request to "/api/plants/{id}"
    Then the API should return HTTP 200 or 204 and the plant should be deleted successfully

Scenario: PM2-API-05 - Admin Prevent negative stock value
    Given the user is authenticated as Admin with a valid access token
    When the admin sends a POST request to "/api/plants" with negative quantity "-50"
    Then the API should return HTTP 400 with a validation error for negative quantity

Scenario: PM2-API-06 - User Prevent plant creation by user
    Given the user is authenticated as User with a valid access token
    When the user sends a POST request to "/api/plants" with plant data
    Then the API should return HTTP 403 indicating access is denied

Scenario: PM2-API-07 - User Prevent plant update by user
    Given the user is authenticated as User with a valid access token
    And there is at least one plant record in the system
    When the user sends a PUT request to "/api/plants/{id}" with updated data
    Then the API should return HTTP 403 indicating update is not allowed

Scenario: PM2-API-08 - User Prevent plant deletion by user
    Given the user is authenticated as User with a valid access token
    And there is at least one plant record in the system
    When the user sends a DELETE request to "/api/plants/{id}"
    Then the API should return HTTP 403 indicating delete action is forbidden

Scenario: PM2-API-09 - User View plant details
    Given the user is authenticated as User with a valid access token
    And there is at least one plant record in the system
    When the user sends a GET request to "/api/plants/{id}"
    Then the API should return HTTP 200 and the plant data should be retrieved successfully

Scenario: PM2-API-10 - User Prevent invalid update attempt
    Given the user is authenticated as User with a valid access token
    And there is at least one plant record in the system
    When the user sends a PUT request to "/api/plants/{id}" with updated quantity
    Then the API should return HTTP 403 and the update operation should be rejected
