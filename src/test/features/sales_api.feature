Feature: Sales Management API
  As an Admin, I want to manage sales via API
  As a User, I want to view sales via API but not modify them
  
  Background:
    Given the plant "Rose" exists with price 10 and stock 100
    Given the plant "TestPlantAPI_Del" exists with price 50 and stock 100


  @SM-API-001 @Admin
  Scenario: Admin creates a valid sale via API
    Given I login as "admin" with password "admin123"
    When I send a POST request to create a sale for plant "Rose"
    Then the response status should be 201

  @SM-API-002 @Admin
  Scenario: Admin deletes a sale via API
    Given I login as "admin" with password "admin123"
    And a sale exists for plant "1"
    When I send a DELETE request to the sale endpoint
    Then the response status should be 204

  @SM-API-003 @Admin
  Scenario: Validation for invalid quantity via API
    Given I login as "admin" with password "admin123"
    When I send a POST request to "/api/sales/plant/1?quantity=0"
    Then the response status should be 400

  @SM-API-004 @Admin
  Scenario: 404 Plant Not Found via API
    Given I login as "admin" with password "admin123"
    When I send a POST request to "/api/sales/plant/9999?quantity=1"
    Then the response status should be 404

  @SM-API-005 @Admin
  Scenario: 404 Sale Not Found via API
    Given I login as "admin" with password "admin123"
    When I send a DELETE request to "/api/sales/9999"
    Then the response status should be 404

  @SM-API-006 @User
  Scenario: User gets all sales via API
    Given I login as "testuser" with password "test123"
    When I send a GET request to "/api/sales"
    Then the response status should be 200

  @SM-API-007 @User
  Scenario: User gets sale by ID via API
    Given I login as "testuser" with password "test123"
    Given a sale exists for "Validation" via API
    When I send a GET request to the sale endpoint
    Then the response status should be 200

  @SM-API-008 @User
  Scenario: User create forbidden via API
    Given I login as "testuser" with password "test123"
    When I send a POST request to "/api/sales/plant/1"
    Then the response status should be 403

  @SM-API-009 @User
  Scenario: User delete forbidden via API
    Given I login as "testuser" with password "test123"
    When I send a DELETE request to "/api/sales/1"
    Then the response status should be 403

  @SM-API-010 @User
  Scenario: User gets paginated sales via API
    Given I login as "testuser" with password "test123"
    When I send a GET request to "/api/sales/page?page=0&size=5"
    Then the response status should be 200
