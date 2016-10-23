groupVance
============
Application Overview
groupVance is a full-stack web application to track daily progress toward a personal goal.  Members join a group and log-in each day to report that they have prayed that day. The Member dashboard displays their team, and each group members progress toward the goal for the past week.  

Outline Plan
------------
* Version 1.0 - MVP
  •	Home Page
    o	Scrolling Links to areas on Home
      •	Who
      •	What
      •	Where
      •	When
      •	Why
      •	How
      •	Contact
        •	E-mail address
    o	Log-in Button
      •	If logged in, this would be a Log-out button
    o	Dashboard Link

  •	Dashboard
    o	Navbar Links
      •	Home
        •	Log-out
          •	If logged out, then Log-in
    o	Welcome Box - Get Preferred Name
      •	DB READ
      •	If logged out, then “Guest”
    o	Personal Stats Box
      •	If logged out, then introductory message
        •	If logged in, then:
          •	Goal today?
            o	Database READ for Step that day
            o	If not, then Button for Yes
              •	Click: DB UPDATE
            o	If yes, then message saying thanks and Button for undo
              •	Click: DB DELETE
          •	You have taken # of steps toward your goal!
            o	DB READ
    o	Group Stats Box
      •	If logged out, then introductory message
      •	If logged in, then:
        •	Graph of group performance over last two weeks
          o	DB Read
        •	Goal Date
          o	If true, then countdown to Goal Date
            •	DB READ
          o	If false, then countup from Start Date
    o	Group Message Box
      •	If logged out, then introductory message
      •	If logged in, then:
        •	List of who in the group had a successful run:
          o	Option to “Hi-5” Successes
            •	Day
            •	Week
            •	Month
            •	Year
        •	List of who in the group had a bad run:
          o	Option to "Light a Fire" under members
    o	Inspirational Box
      •	Randomized Quote from array
      •	Randomized image from array
    o	Resources Box
      •	Links to Resources

  •	Database
    o	Set up tables and relationships
