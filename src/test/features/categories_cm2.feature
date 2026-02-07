@ui @categories2-ui
Feature: Category Management UI - Member 2 (CM2) Scenarios

  @CM2-UI-01
  Scenario: Admin: Open Add Category page
    Given the user is logged in as Admin
    When the admin opens the categories page
    And the admin clicks Add Category
    Then the Add Category page should be opened

  @CM2-UI-02
  Scenario: Admin: Create main category (no parent)
    Given the user is logged in as Admin
    When the admin opens the categories page
    And the admin clicks Add Category
    When the admin creates a main category with name "Category"
    Then the categories page should show the created category

  @CM2-UI-03
  Scenario: Admin: Create sub-category with parent selected
    Given the user is logged in as Admin
    When the admin opens the categories page
    And the admin clicks Add Category
    When the admin creates a sub category with name "Sub" under parent "Category"
    Then the categories page should show the created category

  @CM2-UI-04
  Scenario: Admin: Validation - Category name required
    Given the user is logged in as Admin
    When the admin opens the categories page
    And the admin clicks Add Category
    And the admin tries to save category with empty name
    Then the Category Name required validation should be shown

  @CM2-UI-05
  Scenario: Admin: Validation - name length 3-10 + Cancel navigation
    Given the user is logged in as Admin
    When the admin opens the categories page
    And the admin clicks Add Category
    And the admin enters an invalid name length and tries to save
    Then the Category Name length validation should be shown
    When the admin clicks Cancel on add/edit page
    Then the user should be redirected back to categories page

  @CM2-UI-06
  Scenario: User: Add Category not visible
    Given standard test categories exist
    Given the user is logged in as User
    When the user opens the categories page
    Then Add Category button should be hidden for user

  @CM2-UI-07
  Scenario: User: Edit/Delete actions hidden or disabled
    Given standard test categories exist
    Given the user is logged in as User
    When the user opens the categories page
    Then Edit and Delete actions should be hidden or disabled for user

  @CM2-UI-08
  Scenario: User: Direct access to Add page blocked
    Given the user is logged in as User
    When the user tries to open the add category page
    Then access should be denied

  @CM2-UI-09
  Scenario: User: Direct access to Edit page blocked
    Given the user is logged in as User
    When the user tries to open the edit category page for an existing category
    Then access should be denied

  @CM2-UI-10
  Scenario: User: Attempting delete via request is blocked
    Given the user is logged in as User
    When the user attempts to delete a category by request
    Then the delete request should be forbidden or blocked