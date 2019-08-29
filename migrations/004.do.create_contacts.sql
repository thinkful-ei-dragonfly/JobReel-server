create table "contacts"(
  "contact_id" serial primary key,
  "contact_name" text not null, 
  "job_title" text not null,
  "company" text not null,
  "email" text,
  "linkedin" text,
  "comments" text,
  "date_added" TIMESTAMP DEFAULT now() NOT NULL,
  "connected" BOOLEAN DEFAULT false not null,
  "date_connected" TIMESTAMP DEFAULT null,
  "notification" BOOLEAN DEFAULT true not null,
  "user_id"  INTEGER REFERENCES "users"(id)
    ON DELETE CASCADE NOT NULL
);

