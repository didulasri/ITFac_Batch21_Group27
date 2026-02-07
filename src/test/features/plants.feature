@ui @plant-ui

Feature: Plant Managemnet - Listing, Search, Filter and Low Stock Rules 

Background: QA Training Application is opened
  Given standard test plants exist

@PM1-UI-01
Scenario: Admin views plant listing
    Given the user is logged in as Admin
    When the admin opens the plants page
    Then the list of plants should be displayed

@PM1-UI-02
Scenario: Admin searches plants by name
    Given the user is logged in as Admin
    When the admin opens the plants page
    When the admin searches for the seeded plant
    Then only plants matching the seeded plant name should be displayed

@PM1-UI-03
Scenario: Admin filters plants by category
    Given the user is logged in as Admin
    When the admin opens the plants page
    When the admin filters plants by the seeded category
    Then only plants under the seeded category should be displayed

@PM1-UI-04
  Scenario: Admin views low stock plants
    Given the user is logged in as Admin
    When the admin views the plant listing
    Then low stock plants should be clearly indicated

@PM1-UI-05
Scenario: Admin can see action buttons on plant list
    Given the user is logged in as Admin
    When the admin opens the plants page
    Then admin action buttons should be visible



@PM1-UI-06
Scenario: User views plant listing
    Given the user is logged in as User
    When the user opens the plants page
    Then the list of plants should be displayed

@PM1-UI-07
Scenario: User searches plants by name
    Given the user is logged in as User
    When the user opens the plants page
    When the user searches for the seeded plant
    Then only plants matching the seeded plant name should be displayed

@PM1-UI-08
Scenario: User filters plants by category
    Given the user is logged in as User
    When the user opens the plants page
    When the user filters plants by the seeded category
    Then only plants under the seeded category should be displayed

@PM1-UI-09
Scenario: User views low stock indicator
    Given the user is logged in as User
    When the user views the plant listing
    Then low stock plants should be clearly indicated

@PM1-UI-10
Scenario: User cannot access admin controls
    Given the user is logged in as User
    When the user views the plant listing
    Then admin-only action controls should not be visible