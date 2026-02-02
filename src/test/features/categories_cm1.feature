
Feature: Category Management - Listing, Search, Filter, Sort, Pagination and Role Restrictions

Background: QA Training Application is opened

# ================= ADMIN (5) =================

Scenario: Admin views category listing
  Given the user is logged in as Admin
  When the admin opens the categories page
  Then the list of categories should be displayed

Scenario: Admin searches categories by name
  Given the user is logged in as Admin
  When the admin opens the categories page
  When the admin searches for category "Rose"
  Then only categories matching "Rose" should be displayed

Scenario: Admin filters categories by parent category
  Given the user is logged in as Admin
  When the admin opens the categories page
  When the admin filters categories by parent "Flowers"
  Then only categories under parent "Flowers" should be displayed

Scenario: Admin sorts categories by ID, Name and Parent
  Given the user is logged in as Admin
  When the admin opens the categories page
  When the admin sorts categories by "ID"
  Then categories should be sorted by "ID"
  When the admin sorts categories by "Name"
  Then categories should be sorted by "Name"
  When the admin sorts categories by "Parent category"
  Then categories should be sorted by "Parent category"

Scenario: Admin paginates category listing
  Given the user is logged in as Admin
  When the admin opens the categories page
  When the admin goes to the next page in category pagination
  Then the next set of categories should be displayed

# ================= USER (5) =================

Scenario: User views category listing (read-only)
  Given the user is logged in as User
  When the user opens the categories page
  Then the list of categories should be displayed

Scenario: User searches categories by name
  Given the user is logged in as User
  When the user opens the categories page
  When the user searches for category "Rose"
  Then only categories matching "Rose" should be displayed

Scenario: User filters categories by parent category
  Given the user is logged in as User
  When the user opens the categories page
  When the user filters categories by parent "Flowers"
  Then only categories under parent "Flowers" should be displayed

Scenario: User cannot see admin controls on categories page
  Given the user is logged in as User
  When the user opens the categories page
  Then admin-only category controls should not be visible

Scenario: User is blocked from admin-only category pages
  Given the user is logged in as User
  When the user tries to open the add category page
  Then access should be denied
  When the user tries to open the edit category page for an existing category
  Then access should be denied
