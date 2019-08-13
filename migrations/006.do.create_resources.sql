CREATE TYPE category AS ENUM ('website', 'book', 'github repository', 'magazine', 'online publication', 'podcast');

create table "resources"(
  "resource_id" serial primary key,
  "type" category, 
  "title" text not null,
  "description" text,
  "date_added" TIMESTAMP DEFAULT now() NOT NULL,
  "user_id"  INTEGER REFERENCES "users"(id)
    ON DELETE CASCADE NOT NULL
);
