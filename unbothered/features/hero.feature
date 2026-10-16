Feature: Hero — "Ship without the sh*t"
  As a stressed engineering lead
  I want the hero to tell me instantly that UNBOTHERED absorbs the chaos
  So that I keep scrolling and book a demo

  Background:
    Given I open the landing page

  Scenario: Staggered serif headline with a duck standing in for the "I"
    Then the hero headline reads "SHIP / WITHOUT / THE SH*T" for assistive technology
    And the headline lines are indented in a staircase
    And the "I" in "SH*T" is replaced by a duck icon
    And some headline letters are set in italic

  Scenario: Framed duck video with a glow
    Then I see the hero video inside a frame with 4 crosshair corners
    And a blurred yellow glow sits behind the video frame

  Scenario: Calls to action and social proof
    Then I see a yellow "Book a Demo" button and an outlined "How it works" button with a play icon
    And I see the stat cards:
      | value | label              |
      | 180+  | Regions worldwide  |
      | 2.4B+ | Requests handled   |

  Scenario: Duck footprints pop around the CTA on hover
    When I hover the hero "Book a Demo" button
    Then duck footprints appear around the button

  @desktop
  Scenario: Scrolling pins the hero and grows the video to full viewport
    Given the hero video is ready to scrub
    When I scroll 60% through the hero
    Then the hero stays pinned to the top of the viewport
    And the hero video is less clipped than at the start
    And the hero video has advanced past the first frame

  @desktop
  Scenario: The scrub reaches full bleed at the end of the pin
    When I scroll to the end of the hero pin
    Then the hero video fills the viewport
