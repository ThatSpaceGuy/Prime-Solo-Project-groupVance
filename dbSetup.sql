-- Run these SQL commands to set-up the database

CREATE TABLE members (
	id SERIAL PRIMARY KEY,
	first_name VARCHAR,
	last_name VARCHAR,
	pref_name VARCHAR,
  log_email VARCHAR,
	alert_email VARCHAR,
	twitter VARCHAR,
	sms VARCHAR,
	team_id INTEGER,
	created TIMESTAMP DEFAULT current_timestamp
);

CREATE TABLE steps (
	id SERIAL PRIMARY KEY,
	member_id INTEGER,
	action_id INTEGER,
	created TIMESTAMP DEFAULT current_timestamp
);

CREATE TABLE actions (
	id SERIAL PRIMARY KEY,
	type VARCHAR
);

CREATE TABLE groups (
	id SERIAL PRIMARY KEY,
	title VARCHAR,
	action_id INTEGER,
	created TIMESTAMP DEFAULT current_timestamp
);

CREATE TABLE member_group (
	id SERIAL PRIMARY KEY,
	member_id INTEGER,
	group_id INTEGER,
	created TIMESTAMP DEFAULT current_timestamp
);

CREATE TABLE teams (
	id SERIAL PRIMARY KEY,
	title VARCHAR
);

CREATE TABLE team_zone (
	id SERIAL PRIMARY KEY,
	team_id INTEGER,
	zone_id INTEGER
);

CREATE TABLE zones (
	id SERIAL PRIMARY KEY,
	designation VARCHAR,
	24_position FLOAT
);

CREATE TABLE shouts (
	id SERIAL PRIMARY KEY,
  delivered BOOLEAN,
	fan_id INTEGER,
	runner_id INTEGER,
	cheer_id INTEGER,
	message VARCHAR,
	created TIMESTAMP DEFAULT current_timestamp
);

CREATE TABLE cheers (
	id SERIAL PRIMARY KEY,
	type VARCHAR
);
