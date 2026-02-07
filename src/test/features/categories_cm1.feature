@ui @categories-ui
Feature: Category Management - Listing, Search, Filter, Sort, Pagination and Role Restrictions

Background: QA Training Application is opened
  Given standard test categories exist

# ================= ADMIN (5) =================
@CM1-UI-01
Scenario: Admin views category listing
  Given the user is logged in as Admin
  When the admin opens the categories page
  Then the list of categories should be displayed

@CM1-UI-02
Scenario: Admin searches categories by name
  Given the user is logged in as Admin
  When the admin opens the categories page
  When the admin searches for the seeded category name
  Then only categories matching the seeded category name should be displayed

@CM1-UI-03
Scenario: Admin filters categories by parent category
  Given the user is logged in as Admin
  When the admin opens the categories page
  When the admin filters categories by the seeded parent category
  Then only categories under the seeded parent category should be displayed

@CM1-UI-04
Scenario: Admin sorts categories by ID, Name and Parent
  Given the user is logged in as Admin
  When the admin opens the categories page
  When the admin sorts categories by "ID"
  Then categories should be sorted by "ID"
  When the admin sorts categories by "Name"
  Then categories should be sorted by "Name"
  When the admin sorts categories by "Parent category"
  Then categories should be sorted by "Parent category"

@CM1-UI-05
Scenario: Admin paginates category listing
  Given the user is logged in as Admin
  When the admin opens the categories page
  When the admin goes to the next page in category pagination
  Then the next set of categories should be displayed

# ================= USER (5) =================

@CM1-UI-06
Scenario: User views category listing (read-only)
  Given the user is logged in as User
  When the user opens the categories page
  Then the list of categories should be displayed

@CM1-UI-07
Scenario: User searches categories by name
  Given the user is logged in as User
  When the user opens the categories page
  When the user searches for the seeded category name
  Then only categories matching the seeded category name should be displayed

@CM1-UI-08
Scenario: User filters categories by parent category
  Given the user is logged in as User
  When the user opens the categories page
  When the user filters categories by the seeded parent category
  Then only categories under the seeded parent category should be displayed

@CM1-UI-09
Scenario: User cannot see admin controls on categories page
  Given the user is logged in as User
  When the user opens the categories page
  Then admin-only category controls should not be visible

@CM1-UI-10
Scenario: User is blocked from admin-only category pages
  Given the user is logged in as User
  When the user tries to open the add category page
  Then access should be denied
  When the user tries to open the edit category page for an existing category
  Then access should be denied
