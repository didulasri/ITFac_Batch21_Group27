Feature: Sales Management UI
  As an Admin, I want to manage sales
  As a User, I want to view sales but not modify them

  Background:
    Given the plant "Rose" exists with price 10 and stock 100
    And the plant "Tulip" exists with price 15 and stock 50
    And the plant "Orchid" exists with price 20 and stock 50
    And the plant "Sunflower" exists with price 12 and stock 50

  @SM-UI-001 @Admin
  Scenario: Admin creates a valid sale
    Given I login as "admin" with password "admin123"
    And I navigate to the Sales page
    When I click the Sell Plant button
    And I select plant "Rose" with quantity "5"
    And I click Save
    Then I should see the sale for "Rose" in the list

  @SM-UI-002 @Admin
  Scenario: Validation for invalid quantity
    Given I login as "admin" with password "admin123"
    And I navigate to the Sales page
    When I click the Sell Plant button
    And I select plant "Tulip" with quantity "-1"
    And I click Save
    Then I should see an error message "Quantity must be greater than 0"

  @SM-UI-003 @Admin
  Scenario: Admin deletes a sale
    Given I login as "admin" with password "admin123"
    And I navigate to the Sales page
    Given a sale exists for "Orchid" via UI
    When I click Delete on the sale for "Orchid"
    And I confirm the deletion
    Then I should not see the sale for "Orchid" in the list

  @SM-UI-004 @Admin
  Scenario: Cancel delete action
    Given I login as "admin" with password "admin123"
    And I navigate to the Sales page
    Given a sale exists for "Sunflower" via UI
    When I click Delete on the sale for "Sunflower"
    And I cancel the deletion
    Then I should see the sale for "Sunflower" in the list

  @SM-UI-005 @Admin
  Scenario: Verify Sell Plant button visibility for Admin
    Given I login as "admin" with password "admin123"
    And I navigate to the Sales page
    Then the "Sell Plant" button should be visible

  @SM-UI-006 @User
  Scenario: User views Sales List
    Given I login as "testuser" with password "test123"
    And I navigate to the Sales page
    Then I should see the Sales list with columns "Plant" and "Quantity"

  @SM-UI-007 @User
  Scenario: Sell Plant button hidden for User
    Given I login as "testuser" with password "test123"
    And I navigate to the Sales page
    Then the "Sell Plant" button should be hidden

  @SM-UI-008 @User
  Scenario: Delete button hidden for User
    Given I login as "testuser" with password "test123"
    And I navigate to the Sales page
    Then the Delete action should be hidden for all rows

  @SM-UI-009 @User
  Scenario: Default sorting by Date Descending
    Given I login as "testuser" with password "test123"
    And I navigate to the Sales page
    Then the list should be sorted by Date in descending order

  @SM-UI-010 @User
  Scenario: Direct access to new sale page blocked for User
    Given I login as "testuser" with password "test123"
    When I navigate directly to "/ui/sales/new"
    Then I should be redirected to the 403 Access Denied page
