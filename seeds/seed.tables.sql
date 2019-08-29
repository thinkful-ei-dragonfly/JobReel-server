BEGIN;

TRUNCATE
  resources,
  companies,
  contacts,
  events,
  jobs,
  users
RESTART IDENTITY CASCADE;

INSERT INTO "users" ("profile_photo", "email", "first_name", "last_name", "username", "password", "city", "industry", "job_title")
VALUES
(null, 'admin@email.com','Dunder','Mifflin','admin','$2a$12$tQnuoW3KLqtMlMQ2eOP5ZekeYkU0jzCvWG5RO.CqZ7J7yBEVCCi92', null, null, null);

INSERT INTO "jobs" ("job_title", "company", "city", "state", "url", "description", "status", "date_applied", "user_id")
VALUES
('Junior React Developer','Amazon','Seattle','WA','https://amazon.com', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 'Interested', null, 1),
('Software Engineer','Google','New York','NY','https://google.com', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 'Applied', '2019-08-20T15:03:05.646Z', 1),
('Frontend Developer','IBM','New York','NY','https://ibm.com', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 'Interested', null, 1);

INSERT INTO "events" ("event_name", "host", "city", "state", "address", "date", "url", "description", "status", "user_id")
VALUES
('September NY Tech Meetup','NY Tech Alliance','New York','NY', '111 St Name', '2019-10-20T15:03:05.646Z', 'https://www.eventbrite.com', null, 'Will Attend', 1),
('APIs and IPAs','Seattle Tech','Seattle','WA','222 St Name', '2019-08-25T15:03:05.646Z', 'https://www.meetup.com', 'Met several senior developers from Amazon', 'Attended', 1);

INSERT INTO "contacts" ("contact_name", "job_title", "company", "email", "linkedin", "comments", "connected", "date_connected", "user_id")
VALUES
('John Smith','Senior Software Engineer', 'IBM', 'john.smith@email.com','https://linkedin.com', null, false, null, 1),
('Jane Smith','Junior Backend Developer', 'AWS', 'jane.smith@email.com','https://linkedin.com', 'connected at Seattle event', true, '2019-08-19T15:03:05.646Z', 1);

INSERT INTO "companies" ("company_name", "city", "state", "industry", "website", "description", "contact", "date_added", "user_id")
VALUES
('Google','Mountain View', 'CA', 'Tech','https://google.com', null, null, '2019-10-20T15:03:05.646Z', 1),
('IBM','Armonk', 'NY', 'Tech','https://ibm.com', 'operations in over 170 countries', 'John Smith', '2019-08-24T15:03:05.646Z', 1);

INSERT INTO "resources" ("type", "title", "description", "date_added","user_id")
VALUES
('book','Cracking the Coding Interview', '189 programming interview questions', '2019-08-24T15:03:05.646Z', 1),
('website','Python Tutor', 'http://pythontutor.com/javascript.html#mode=edit', '2019-08-23T15:03:05.646Z', 1);

COMMIT;