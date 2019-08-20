create table "users"(
  "id" serial primary key,
  "profile_photo" text, 
  "email" text not null,
  "first_name" text not null,
  "last_name" text not null,
  "username" text not null unique,
  "password" text not null,
  "city" text,
  "industry" text,
  "job_title" text,
);