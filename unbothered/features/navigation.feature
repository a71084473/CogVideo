Feature: Navigation bar
  As a visitor evaluating cloud vendors
  I want a clear, branded navigation
  So that I can find product info or book a demo at any time

  Background:
    Given I open the landing page

  Scenario: Brand and primary links are visible
    Then I see the "UNBOTHERED" logo with the duck feet icon
    And the navigation contains the links:
      | Solutions |
      | Features  |
      | Pricing   |
      | Resources |
    And I see an outlined "Book a Demo" pill in the navigation
