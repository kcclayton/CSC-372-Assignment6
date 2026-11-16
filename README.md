# Trivia Book API

A Node/Express API for trivia questions, backed by a Neon Postgres database.

## Database schema

**topics**
| Column | Type | Notes |
|---|---|---|
| id | SERIAL | Primary key |
| name | VARCHAR(50) | Unique, not null |

**questions**
| Column | Type | Notes |
|---|---|---|
| id | SERIAL | Primary key |
| topic_id | INTEGER | Foreign key → topics.id |
| question | TEXT | Not null |
| answer | TEXT | Not null |
| difficulty | VARCHAR(10) | `easy`, `medium` or `hard` |

## Setup

1. Clone this repository.
2. Run `npm install`.
3. Create a Neon project and copy its connection string (Dashboard → Connect).
4. Copy `.env.example` to `.env` and paste the connection string into `DATABASE_URL`.
5. Run `npm run seed` to create the tables and load the starter questions.
6. Run `npm start`. The API runs at `http://localhost:3000/triviabook`.

## Endpoints

TODO: list each endpoint with its method, path, parameters and an example response.
