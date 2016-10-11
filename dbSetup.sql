-- Run these SQL commands to set-up the database
-- Table of members
CREATE TABLE members (
	id SERIAL PRIMARY KEY,
	first_name VARCHAR NOT NULL,
	last_name VARCHAR NOT NULL,
	pref_name VARCHAR,
  log_email VARCHAR NOT NULL,
	alert_email VARCHAR,
	twitter VARCHAR,
	sms VARCHAR,
	team_id INTEGER,
	created TIMESTAMP DEFAULT current_timestamp
);
-- Table to track steps taken each day
CREATE TABLE steps (
	id SERIAL PRIMARY KEY,
	member_id INTEGER NOT NULL,
	action_id INTEGER NOT NULL,
	created TIMESTAMP DEFAULT current_timestamp
);
-- Table to track the kinds of actions people are taking
CREATE TABLE actions (
	id SERIAL PRIMARY KEY,
	type VARCHAR NOT NULL
);
-- Table for groups
CREATE TABLE groups (
	id SERIAL PRIMARY KEY,
	title VARCHAR NOT NULL,
	action_id INTEGER,
	created TIMESTAMP DEFAULT current_timestamp
);
-- Join table for members and groups
CREATE TABLE member_group (
	id SERIAL PRIMARY KEY,
	member_id INTEGER NOT NULL,
  member_action INTEGER NOT NULL,
	group_id INTEGER NOT NULL,
	created TIMESTAMP DEFAULT current_timestamp
);
-- Teams table with the title of each team
CREATE TABLE teams (
	id SERIAL PRIMARY KEY,
	title VARCHAR NOT NULL
);
-- Join table for teams and zones
CREATE TABLE team_zone (
	id SERIAL PRIMARY KEY,
	team_id INTEGER NOT NULL,
	zone_id INTEGER NOT NULL
);
-- Zones table to track time zones
CREATE TABLE zones (
	id SERIAL PRIMARY KEY,
	designation VARCHAR NOT NULL,
  -- H24 refers to hour of mercy position around the world
	H24_position FLOAT NOT NULL
);
-- Shouts refer to a message sent to encourage someone
CREATE TABLE shouts (
	id SERIAL PRIMARY KEY,
  delivered BOOLEAN NOT NULL,
	fan_id INTEGER NOT NULL,
	runner_id INTEGER NOT NULL,
	cheer_id INTEGER NOT NULL,
	message VARCHAR,
	created TIMESTAMP DEFAULT current_timestamp
);
-- Cheer type will be "High-Five" or "Light a Fire" initially
CREATE TABLE cheers (
	id SERIAL PRIMARY KEY,
	type VARCHAR NOT NULL
);
