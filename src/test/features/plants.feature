Feature: Plant Managemnet - Listing, Search, Filter and Low Stock Rules 

Background: QA Training Application is opened

Scenario: Admin views plant listing
    Given the user is logged in as Admin
    When the admin opens the plants page
    Then the list of plants should be displayed

Scenario: Admin searches plants by name
    Given the user is logged in as Admin
    When the admin searches for plant "Rose"
    Then only plants matching "Rose" should be displayed

Scenario: Admin filters plants by category
    Given the user is logged in as Admin
    When the admin filters plants by category "Indoor"
    Then only plants under category "Indoor" should be displayed

  Scenario: Admin views low stock plants
    Given the user is logged in as Admin
    When the admin views the plant listing
    Then low stock plants should be clearly indicated

Scenario: Admin can see action buttons on plant list
    Given user logs in as Admin
    When admin opens plants page
    Then admin action buttons should be visible




Scenario: User views plant listing
    Given the user is logged in as User
    When the user opens the plants page
    Then the list of plants should be displayed

Scenario: User searches plants by name
    Given the user is logged in as User
    When the user searches for plant "Lily"
    Then only plants matching "Lily" should be displayed

Scenario: User filters plants by category
    Given the user is logged in as User
    When the user filters plants by category "Outdoor"
    Then only plants under category "Outdoor" should be displayed

Scenario: User views low stock indicator
    Given the user is logged in as User
    When the user views the plant listing
    Then low stock plants should be clearly indicated

Scenario: User cannot access admin controls
    Given the user is logged in as User
    When the user views the plant listing
    Then admin-only action controls should not be visible