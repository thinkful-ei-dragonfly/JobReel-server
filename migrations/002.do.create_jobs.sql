create table "jobs"(
  "job_id" serial primary key,
  "job_title" text not null, 
  "company" text not null,
  "city" text not null,
  "state" text not null,
  "date_added" TIMESTAMP DEFAULT now() NOT NULL,
  "url" text not null,
  "description" text,
  "status" text DEFAULT 'Interested' NOT NULL,
  "user_id"  INTEGER REFERENCES "users"(id)
    ON DELETE CASCADE NOT NULL
);
