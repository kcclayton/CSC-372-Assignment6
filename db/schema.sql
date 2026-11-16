-- Trivia Book schema (PostgreSQL / Neon)
-- Drops and recreates both tables so it can be re-run safely.

DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS topics;

CREATE TABLE topics (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE questions (
    id         SERIAL PRIMARY KEY,
    topic_id   INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    question   TEXT NOT NULL,
    answer     TEXT NOT NULL,
    difficulty VARCHAR(10) NOT NULL
               CHECK (difficulty IN ('easy', 'medium', 'hard'))
);
