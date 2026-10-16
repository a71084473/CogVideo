@mobile
Feature: Mobile experience
  As a visitor on a phone
  I want a stacked layout with simple autoplaying video
  So that the page is fast and easy to read

  Background:
    Given I am on a phone-sized screen
    And I open the landing page

  Scenario: Videos autoplay instead of scrubbing
    Then the page is in "autoplay" motion mode
    And the hero is not pinned
    And the hero video autoplays on a muted loop

  Scenario: The inner workings split is stacked
    When I scroll to the "inner-workings" section
    Then the left panel is stacked above the dive video

  Scenario: Accordion items open on tap
    When I scroll to the "inner-workings" section
    And I tap accordion item "003"
    Then accordion item "003" is expanded with a description and a mini chart

  Scenario: No horizontal scrolling
    Then the page does not scroll horizontally
