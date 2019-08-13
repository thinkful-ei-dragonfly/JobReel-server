create table "companies"(
  "company_id" serial primary key,
  "company_name" text not null, 
  "city" text not null,
  "state" text not null,
  "industry" text,
  "website" text,
  "description" text,
  "contact" text,
  "date_added" TIMESTAMP DEFAULT now() NOT NULL,
  "user_id"  INTEGER REFERENCES "users"(id)
    ON DELETE CASCADE NOT NULL
);

--optional if we implement API:

-- "image" text,
-- "employee_count" integer,
-- "rank" integer,

