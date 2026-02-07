@PM2-UI
@ui
@PM2

Feature: Plant Management PM2 - CRUD Operations and Valiations

# UI TEST CASES - ADMIN

@PM2-UI-01
Scenario: PM2-UI-01 - Admin Create a new plant with valid data
    Given the admin user is logged in
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

@PM2-UI-02
Scenario: PM2-UI-02 - Admin Validate required fields when creating plant
    Given the admin user is logged in
    When the admin opens the plants page
    And the admin clicks the Add Plant button
    And the admin leaves all required fields empty
    And the admin clicks the Save button
    Then validation messages should be displayed for all required fields

@PM2-UI-03
Scenario: PM2-UI-03 - Admin Update existing plant details
    Given the admin user is logged in
    And there is at least one plant record in the system
    When the admin opens the plants page
    And the admin clicks the Edit button for the first plant
    And the admin modifies the plant name to "Updated Plant"
    And the admin modifies the plant price to "900"
    And the admin clicks the Save button
    Then the updated plant details should be saved successfully

@PM2-UI-04
Scenario: PM2-UI-04 - Admin Delete a plant
    Given the admin user is logged in
    And there is at least one plant record in the system
    When the admin opens the plants page
    And the admin clicks the Delete button for a plant
    And the admin confirms the deletion
    Then the selected plant should be deleted successfully and removed from the list

@PM2-UI-05
Scenario: PM2-UI-05 - Admin Prevent negative quantity input
    Given the admin user is logged in
    When the admin opens the plants page
    And the admin clicks the Add Plant button
    And the admin enters plant name "Rose"
    And the admin enters negative quantity "-10"
    And the admin clicks the Save button
    Then the system should prevent saving and display validation error for negative quantity

# UI TEST CASES - USER

@PM2-UI-06
Scenario: PM2-UI-06 - User View plant list
    Given the standard user is logged in
    When the user opens the plants page
    Then the list of plants should be displayed with available plant records

@PM2-UI-07
Scenario: PM2-UI-07 - User Verify Add Plant button is hidden
    Given the standard user is logged in
    When the user opens the plants page
    Then the Add Plant button should not be visible to the user

@PM2-UI-08
Scenario: PM2-UI-08 - User Verify Edit option is disabled
    Given the standard user is logged in
    When the user opens the plants page
    And the user views the plant list
    Then the Edit option should be disabled or hidden for the user

@PM2-UI-09
Scenario: PM2-UI-09 - User Verify Delete option is hidden
    Given the standard user is logged in
    When the user opens the plants page
    Then the Delete option should not be visible to the user

@PM2-UI-10
Scenario: PM2-UI-10 - User View plant details
    Given the standard user is logged in
    And there is at least one plant record in the system
    When the user opens the plants page
    And the user selects a plant from the list
    Then the selected plant details should be displayed correctly
