-- Run these SQL commands to set-up the database
-- Table of members
CREATE TABLE members (
	id SERIAL PRIMARY KEY,
	first_name VARCHAR NOT NULL,
	last_name VARCHAR NOT NULL,
	pref_name VARCHAR,
  log_email VARCHAR NOT NULL UNIQUE,
	alert_email VARCHAR,
	twitter VARCHAR,
	sms VARCHAR,
	team_id INTEGER,
	created TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp
);
-- Table to track steps taken each day
CREATE TABLE steps (
	id SERIAL PRIMARY KEY,
	member_id INTEGER NOT NULL,
	action_id INTEGER NOT NULL,
	created TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp
);
-- Table to track the kinds of actions people are taking
CREATE TABLE actions (
	id SERIAL PRIMARY KEY,
	type VARCHAR NOT NULL
);
-- Table for groups
CREATE TABLE groups (
	id SERIAL PRIMARY KEY,
	title VARCHAR NOT NULL UNIQUE,
	action_id INTEGER,
	status VARCHAR(50) NOT NULL DEFAULT 'Open',
	created TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp
);
-- Join table for members and groups
CREATE TABLE member_group (
	id SERIAL PRIMARY KEY,
	member_id INTEGER NOT NULL,
  member_action INTEGER NOT NULL,
	group_id INTEGER NOT NULL,
	created TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp
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
  delivered BOOLEAN NOT NULL DEFAULT false,
	fan_id INTEGER NOT NULL,
	runner_id INTEGER NOT NULL,
	cheer_id INTEGER NOT NULL,
	message VARCHAR,
	created TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp
);
-- Cheer type will be "High Five" or "Light a Fire" initially
CREATE TABLE cheers (
	id SERIAL PRIMARY KEY,
	type VARCHAR NOT NULL
);

INSERT INTO cheers (type) VALUES ('High Five');
INSERT INTO cheers (type) VALUES ('Light A Fire');
INSERT INTO cheers (type) VALUES ('Thanks');

CREATE VIEW members_join_groups AS
	SELECT members.first_name,
    members.last_name,
    members.pref_name,
    members.log_email,
    members.alert_email,
    members.twitter,
    members.sms,
    members.team_id,
    members.created AS member_created,
    actions.type AS action_type,
    groups.title AS group_title,
    groups.created AS group_created,
    members.id AS member_id,
    groups.status AS group_status
   FROM members
     LEFT JOIN member_group ON members.id = member_group.member_id
     LEFT JOIN actions ON member_group.member_action = actions.id
     LEFT JOIN groups ON member_group.group_id = groups.id;

CREATE VIEW members_join_info AS
SELECT members.first_name,
    members.last_name,
    members.pref_name,
    members.log_email,
    members.alert_email,
    members.twitter,
    members.sms,
    members.team_id,
    members.created AS member_created,
    steps.id AS step_id,
    members.id AS member_id,
    steps.action_id,
    steps.created AS step_created,
    actions.type AS action_type,
    groups.title AS group_title,
    groups.created AS group_created
   FROM members
     LEFT JOIN steps ON members.id = steps.member_id
     LEFT JOIN member_group ON members.id = member_group.member_id
     LEFT JOIN actions ON member_group.member_action = actions.id
     LEFT JOIN groups ON member_group.group_id = groups.id;

CREATE VIEW received_shouts AS
SELECT r.first_name AS runner_first_name,
    r.pref_name AS runner_pref_name,
    r.log_email AS runner_email,
    r.id AS runner_id,
    c.type AS cheer_type,
    f.first_name AS fan_first_name,
    f.pref_name AS fan_pref_name,
    f.id AS fan_id,
    s.delivered AS shout_heard,
    s.created AS shout_created,
    s.id AS shout_id,
    f.log_email AS fan_email
   FROM members r
     JOIN shouts s ON r.id = s.runner_id
     JOIN members f ON f.id = s.fan_id
     JOIN cheers c ON c.id = s.cheer_id;
