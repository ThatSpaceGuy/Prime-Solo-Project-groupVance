Total Mercy
============
Application Overview
TotalMercy.com is a full-stack web application to track daily intercession centered on the Hour of Mercy (3:00 o’clock hour).  Members sign up to pray daily and log-in each day to report that they have prayed that day.  The application organizes the intercessors into teams and can give information about numbers of intercessors and times of the day covered by prayer.  The Member dashboard will display their team, where in the world it is currently the Hour of Mercy, and other inspirational items.  Members can sign up to be reminded to pray in a few different ways - initial plans are e-mail, text, and possibly Twitter and Facebook.   TotalMercy.com will use teams to organize and track members and prayer coverage, but this will not be part of the primary understanding of members - so as to not complicate their involvement.


Versioning Plan
---------------
* 0.1 - ReadMe & html/js/css/server/heroku handshakes - initial commit


Outline Plan
------------
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
    •	Form – sends an e-mail to me
      o	ReCapcha
        •	RESEARCH - Medium
      o	Log-in Button
•	If logged in, this would be a Log-out button
  o	Dashboard Link
  o	Mercy Map Link
  o	STRETCH - Routing Link to Artists
  o	STRETCH - Routing Link to Donate

•	Dashboard
o	Navbar Links
•	Home
•	Log-out
•	If logged out, then Log-in
•	Mercy Map Link
o	Get Preferred Name
•	DB READ
•	If logged out, then “Guest”
o	Get Current timezone from user
•	RESEARCH – Mild
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
•	Subscribed to e-mail Mercy Alerts?
o	DB READ
o	If yes, then:
•	 unsubscribe button
•	Click: Are you sure? – DB UPDATE
•	Reminder at time of day field
•	DB READ
•	Update Button – required new time
o	Click: Sure? – DB UPDATE
o	If no, then subscribe button
•	Click: Are you sure? – then DB UPDATE
•	Reminder at time of day field required
o	STRETCH – modify address to be different from Auth0 login
•	E-mail verification – click link in e-mail
•	RESEARCH – Medium
