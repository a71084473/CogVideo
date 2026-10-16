Feature: The inner workings — what's going on beneath the water
  As a technical buyer
  I want a step-by-step look at how the platform behaves under load
  So that I trust it with production traffic

  Background:
    Given I open the landing page

  Scenario: Split layout content
    When I scroll to the "inner-workings" section
    Then I see the tag pill "The inner workings (3)"
    And I see the headline "WHAT'S GOING ON BENEATH WATER?"
    And the accordion lists:
      | number | title                       |
      | 001    | READY FOR THE RUSH          |
      | 002    | EVERY REQUEST, ON TRACK     |
      | 003    | BACK UP BEFORE YOU NOTICE   |

  @desktop
  Scenario: Left panel slides in from the left
    When I scroll to the start of the "inner-workings" section
    Then the left panel is off-screen to the left
    When I scroll 30% through the "inner-workings" section
    Then the left panel is fully in view

  @desktop
  Scenario Outline: Active accordion item follows scroll progress
    When I scroll <progress>% through the "inner-workings" section
    Then accordion item "<number>" is expanded with a description and a mini chart
    And the other accordion items are collapsed

    Examples:
      | progress | number |
      | 35       | 001    |
      | 65       | 002    |
      | 95       | 003    |

  @desktop
  Scenario: The dive video is scrubbed by scroll
    Given the dive video is ready to scrub
    When I scroll 90% through the "inner-workings" section
    Then the dive video has advanced past the first frame
