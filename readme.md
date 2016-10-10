Total Mercy
============
Application Overview
TotalMercy.com is a full-stack web application to track daily intercession centered on the Hour of Mercy (3:00 o’clock hour).  Members sign up to pray daily and log-in each day to report that they have prayed that day.  The application organizes the intercessors into teams and can give information about numbers of intercessors and times of the day covered by prayer.  The Member dashboard will display their team, where in the world it is currently the Hour of Mercy, and other inspirational items.  Members can sign up to be reminded to pray in a few different ways - initial plans are e-mail, text, and possibly Twitter and Facebook.   TotalMercy.com will use teams to organize and track members and prayer coverage, but this will not be part of the primary understanding of members - so as to not complicate their involvement.


Versioning Plan
---------------
* 0.1 - ReadMe & html/js/css/server/heroku handshakes - initial commit

* 1.0 - Test and sign off on MVP

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
          •	Prayed today?
            o	Database READ for prayer that day
            o	If not, then Button for Yes
              •	Click: DB UPDATE
            o	If yes, then message saying thanks for praying today and Button for undo
              •	Click: DB DELETE
          •	You have covered # of days with prayer!
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
      •	Links to Prayer Resources and Charities to Support

  •	Database
    o	Set up tables and relationships
