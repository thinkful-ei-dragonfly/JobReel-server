create table "events"(
  "event_id" serial primary key,
  "event_name" text not null, 
  "host" text not null,
  "city" text not null,
  "state" text not null,
  "address" text,
  "date" TIMESTAMP NOT NULL,
  "url" text not null,
  "description" text,
  "status" text DEFAULT 'Will Attend' NOT NULL,
  "user_id"  INTEGER REFERENCES "users"(id)
    ON DELETE CASCADE NOT NULL
);

-- frontend will need to convert manually entered dates into UTC


