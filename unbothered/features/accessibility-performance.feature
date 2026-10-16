Feature: Motion preferences and loading performance
  As a visitor who is sensitive to motion, or on a slow connection
  I want the page to respect my settings and load only what it needs

  @reduced-motion
  Scenario: Reduced motion disables pinning, scrubbing and smooth scroll
    Given I prefer reduced motion
    And I open the landing page
    Then the page is in "static" motion mode
    And the hero is not pinned
    And smooth scrolling is disabled

  @desktop
  Scenario: Below-the-fold videos are lazy-loaded
    Given I open the landing page
    Then the "inner-workings" video has not started loading
    When I scroll to the "inner-workings" section
    Then the "inner-workings" video has a source

  @desktop
  Scenario: Desktop uses scroll scrubbing
    Given I open the landing page
    Then the page is in "scrub" motion mode
    And smooth scrolling is enabled
