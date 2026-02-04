@api
Feature: Category Management - API Test Cases (CM1)

  Background:
    Given the CM1 API base URL is "http://localhost:8080"

  @CM1-API-01
  Scenario: Admin: GET categories page default
    Given CM1 admin is authenticated with a valid token
    When CM1 admin sends GET request to "/api/categories/page?page=0&size=10&sortField=id&sortDir=asc"
    Then the CM1 response status code should be 200
    And the CM1 response should contain paginated categories

  @CM1-API-02
  Scenario: Admin: GET categories page search by name
    Given CM1 admin is authenticated with a valid token
    And a CM1 category with name "Rose" exists
    When CM1 admin sends GET request to "/api/categories/page?name={cm1CreatedCategoryName}&page=0&size=10"
    Then the CM1 response status code should be 200
    And the CM1 response should contain categories matching name "{cm1CreatedCategoryName}"

  @CM1-API-03
  Scenario: Admin: GET categories page filter by parentId
    Given CM1 admin is authenticated with a valid token
    And a CM1 main category with name "FilterParent" exists
    And a CM1 sub-category with name "FilterChild" exists under the created parent
    When CM1 admin sends GET request to "/api/categories/page?parentId={cm1ParentCategoryId}&page=0&size=10"
    Then the CM1 response status code should be 200
    And the CM1 response should contain categories with parentId "{cm1ParentCategoryId}"

  @CM1-API-04
  Scenario: Admin: GET category by id success
    Given CM1 admin is authenticated with a valid token
    And a CM1 category with name "GetById" exists
    When CM1 admin sends GET request to "/api/categories/{cm1CreatedCategoryId}"
    Then the CM1 response status code should be 200
    And the CM1 response should contain category with correct id and name

  @CM1-API-05
  Scenario: Admin: Pagination endpoint rejects invalid params
    Given CM1 admin is authenticated with a valid token
    When CM1 admin sends GET request to "/api/categories/page?page=-1&size=0&sortDir=invalid"
    Then the CM1 response status code should be 400

  @CM1-API-06
  Scenario: User: GET categories allowed
    Given CM1 user is authenticated with a valid token
    When CM1 user sends GET request to "/api/categories"
    Then the CM1 response status code should be 200
    And the CM1 response should contain a list of categories

  @CM1-API-07
  Scenario: User: GET categories page allowed
    Given CM1 user is authenticated with a valid token
    When CM1 user sends GET request to "/api/categories/page?page=0&size=10"
    Then the CM1 response status code should be 200
    And the CM1 response should contain paginated results

  @CM1-API-08
  Scenario: User: GET category by id allowed
    Given CM1 user is authenticated with a valid token
    And a CM1 category with name "UserGet" exists
    When CM1 user sends GET request to "/api/categories/{cm1CreatedCategoryId}"
    Then the CM1 response status code should be 200
    And the CM1 response should contain category with correct id and name

  @CM1-API-09
  Scenario: User: GET summary allowed
    Given CM1 user is authenticated with a valid token
    When CM1 user sends GET request to "/api/categories/summary"
    Then the CM1 response status code should be 200

  @CM1-API-10
  Scenario: User: GET sub-categories allowed
    Given CM1 user is authenticated with a valid token
    When CM1 user sends GET request to "/api/categories/sub-categories"
    Then the CM1 response status code should be 200
