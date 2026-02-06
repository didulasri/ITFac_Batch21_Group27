@ui @sales-ui
Feature: Sales Management UI

  Background:
    Given the Sales Admin is logged in

  @SM-UI-001
  Scenario: Admin creates a sale
    Given a plant exists for sales
    When the admin navigates to the Sales page
    And the admin clicks the Sell Plant button in Sales
    And the admin selects the plant in Sales
    And the admin enters quantity "1" in Sales
    And the admin clicks the Save button in Sales
    Then the sale should be created and listed

  @SM-UI-002
  Scenario: Validation (Invalid Qty)
    Given the Sales Admin is logged in
    When the admin navigates to the Sales page
    And the admin clicks the Sell Plant button in Sales
    And the admin selects the plant in Sales
    And the admin enters quantity "0" in Sales
    And the admin clicks the Save button in Sales
    Then an error "Quantity must be greater than 0" should be displayed in Sales

  @SM-UI-003
  Scenario: Admin deletes sale
    Given the Sales Admin is logged in
    And a sale exists in the system for UI
    When the admin navigates to the Sales page
    And the admin clicks Delete on the first sale in Sales
    And the admin confirms deletion in Sales
    Then the sale should be removed from the list in Sales

  @SM-UI-004
  Scenario: Cancel delete action
    Given the Sales Admin is logged in
    And a sale exists in the system for UI
    When the admin navigates to the Sales page
    And the admin clicks Delete on the first sale in Sales
    And the admin cancels deletion in Sales
    Then the sale should remain in the list in Sales

  @SM-UI-005
  Scenario: Verify Sell Button
    Given the Sales Admin is logged in
    When the admin navigates to the Sales page
    Then the Sell Plant button should be visible in Sales

  @SM-UI-006
  Scenario: User views Sales List
    Given the Sales User is logged in
    When the user navigates to the Sales page
    Then the Sales list should load with correct columns

  @SM-UI-007
  Scenario: Sell Button Hidden for User
    Given the Sales User is logged in
    When the user navigates to the Sales page
    Then the Sell Plant button should be hidden in Sales

  @SM-UI-008
  Scenario: Delete Button Hidden for User
    Given the Sales User is logged in
    When the user navigates to the Sales page
    Then the Delete buttons should be hidden in Sales

  @SM-UI-009
  Scenario: Default Sorting
    Given the Sales User is logged in
    When the user navigates to the Sales page
    Then the Sales list should be sorted by Date Descending by default

  @SM-UI-010
  Scenario: Direct Access Blocked
    Given the Sales User is logged in
    When the user tries to access "/ui/sales/new" directly
    Then access should be denied with 403 or redirect
