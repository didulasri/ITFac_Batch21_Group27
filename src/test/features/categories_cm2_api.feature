@api
Feature: Category Management - API Test Cases (CM2)

  Background:
    Given the CM2 API base URL is "http://localhost:8080"

  @CM2-API-01
  Scenario: Admin: POST create main category success
    Given CM2 admin is authenticated with a valid token
    When CM2 admin sends POST request to "/api/categories" with body {"name":"{cm2GeneratedCategoryName}"}
    Then the CM2 response status code should be 201
    And the CM2 response should contain a category with name "{cm2GeneratedCategoryName}"

  @CM2-API-02
  Scenario: Admin: POST create sub-category success
    Given CM2 admin is authenticated with a valid token
    And a CM2 main category with name "ParentCat" exists
    When CM2 admin sends POST request to "/api/categories" with body {"name":"{cm2GeneratedSubCategoryName}","parentId":{cm2CreatedCategoryId}}
    Then the CM2 response status code should be 201
    And the CM2 response should contain a sub-category with name "{cm2GeneratedSubCategoryName}"

  @CM2-API-03
  Scenario: Admin: POST validation - missing/blank name returns 400
    Given CM2 admin is authenticated with a valid token
    When CM2 admin sends POST request to "/api/categories" with body {}
    Then the CM2 response status code should be 400
    And the CM2 response body should contain error message "Validation failed"

  @CM2-API-04
  Scenario: Admin: PUT update category success
    Given CM2 admin is authenticated with a valid token
    And a CM2 category with name "OldCat" exists
    When CM2 admin sends PUT request to "/api/categories/{cm2CreatedCategoryId}" with body {"name":"{cm2UpdatedCategoryName}"}
    Then the CM2 response status code should be 200
    And the CM2 response should contain a category with name "{cm2UpdatedCategoryName}"

  @CM2-API-05
  Scenario: Admin: DELETE category success + verify removed
    Given CM2 admin is authenticated with a valid token
    And a CM2 category with name "TempCat" exists
    When CM2 admin sends DELETE request to "/api/categories/{cm2CreatedCategoryId}"
    Then the CM2 response status code should be 204
    And a CM2 GET request to "/api/categories/{cm2CreatedCategoryId}" should return 404

  @CM2-API-06
  Scenario: User: POST create category forbidden
    Given CM2 user is authenticated with a valid token
    When CM2 user sends POST request to "/api/categories" with body {"name":"{cm2GeneratedUserCategoryName}"}
    Then the CM2 response status code should be 403

  @CM2-API-07
  Scenario: User: PUT update category forbidden
    Given CM2 user is authenticated with a valid token
    And a CM2 category with name "UserOldCat" exists
    When CM2 user sends PUT request to "/api/categories/{cm2CreatedCategoryId}" with body {"name":"{cm2UpdatedUserCategoryName}"}
    Then the CM2 response status code should be 403

  @CM2-API-08
  Scenario: User: DELETE category forbidden
    Given CM2 user is authenticated with a valid token
    And a CM2 category with name "UserTempCat" exists
    When CM2 user sends DELETE request to "/api/categories/{cm2CreatedCategoryId}"
    Then the CM2 response status code should be 403

  @CM2-API-09
  Scenario: Unauthorized: POST create returns 401
    Given the CM2 API base URL is "http://localhost:8080"
    When an unauthorized CM2 client sends POST request to "/api/categories" with body {"name":"{cm2GeneratedAnonCategoryName}"}
    Then the CM2 response status code should be 401

  @CM2-API-10
  Scenario: Unauthorized: PUT update returns 401
    Given a CM2 category with name "AnonOldCat" exists
    When an unauthorized CM2 client sends PUT request to "/api/categories/{cm2CreatedCategoryId}" with body {"name":"{cm2UpdatedAnonCategoryName}"}
    Then the CM2 response status code should be 401