Feature: "We keep all moving" — floating service bubbles
  As a visitor
  I want to see what UNBOTHERED is doing under the surface
  So that I understand the services I get

  Background:
    Given I open the landing page

  Scenario: Full-screen video with headline and four labelled bubbles
    When I scroll to the "moving" section
    Then I see the headline "WE KEEP ALL MOVING"
    And the "moving" section has a full-screen video
    And I see the bubbles:
      | SCALING  |
      | ROUTING  |
      | RECOVERY |
      | MONITOR  |

  @desktop
  Scenario: Bubbles drift with parallax at different speeds
    When I scroll through the "moving" section
    Then the bubbles have moved by different amounts

  Scenario: A bubble wobbles on hover
    When I scroll to the "moving" section
    And I hover the "ROUTING" bubble
    Then the "ROUTING" bubble is wobbling
