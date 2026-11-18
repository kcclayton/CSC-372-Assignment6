# Trivia Book API

A Node.js/Express REST API for trivia questions, backed by a Neon Postgres database. It follows a model–controller–router architecture.
Try it out [here](https://csc-372-assignment6.onrender.com/triviabook/topic/science?difficulty=easy&limit=1)!

## Tech stack

- Node.js + Express
- PostgreSQL hosted on [Neon](https://neon.com)
- `pg` (Postgres driver) and `dotenv` (environment variables)

## Project structure

```
├── server.js                      # Express app, mounts routes at /triviabook
├── routes/triviaRoutes.js         # Maps each endpoint to a controller function
├── controllers/triviaController.js # Validates input, sends responses and status codes
├── models/triviaModel.js          # SQL queries against the database
├── db/
│   ├── connection.js              # Postgres connection pool
│   ├── schema.sql                 # CREATE TABLE statements
│   └── seed.js                    # Recreates the tables and loads starter data
├── .env.example                   # Template for the required environment variables
└── package.json
```

## Database schema

### `topics`

| Column | Type | Constraints |
|---|---|---|
| `id` | SERIAL | Primary key |
| `name` | VARCHAR(50) | Not null, unique (stored in lowercase) |

### `questions`

| Column | Type | Constraints |
|---|---|---|
| `id` | SERIAL | Primary key |
| `topic_id` | INTEGER | Not null, foreign key → `topics.id` (on delete cascade) |
| `question` | TEXT | Not null |
| `answer` | TEXT | Not null |
| `difficulty` | VARCHAR(10) | Not null, must be `easy`, `medium`, or `hard` |

Each topic has many questions. The seed data creates two topics, `science` (3 questions) and `geography` (2 questions).

## Setup

1. Clone the repository and install dependencies:
   ```
   git clone <repo-url>
   cd <repo-folder>
   npm install
   ```
2. Create a Neon project, open its **Project Dashboard**, click **Connect**, and copy the connection string.
3. Copy `.env.example` to a new file named `.env` and fill it in:
   ```
   PORT=3000
   DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=verify-full
   ```
4. Create the tables and load the starter questions:
   ```
   npm run seed
   ```
   Re-run this command at any time to reset the database to the starter data.
5. Start the server:
   ```
   npm start
   ```
   Or use `npm run dev` to restart automatically when files change. The API runs at `http://localhost:3000/triviabook` (or whichever `PORT` is set in `.env`).

## Endpoints

All endpoints are prefixed with `/triviabook`. Errors are returned as JSON in the form `{ "error": "message" }`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/triviabook/topics` | List all topics |
| GET | `/triviabook/topic/:topic` | List the questions in a topic, with optional `limit` and `difficulty` filters |
| GET | `/triviabook/random` | Get one random question (without its answer) |
| POST | `/triviabook/answer` | Check a guess against a question's answer |
| POST | `/triviabook/question/add` | Add a new question, creating the topic if needed |

---

### GET `/triviabook/topics`

Returns a list of all topic names.

**Example response** `200 OK`
```json
["geography", "science"]
```

---

### GET `/triviabook/topic/:topic`

Returns the questions for the specified topic. The topic name is case-insensitive.

**Query parameters (optional)**

| Parameter | Description |
|---|---|
| `limit` | Positive whole number; caps how many questions are returned |
| `difficulty` | `easy`, `medium`, or `hard`; returns only questions of that difficulty |

**Example request**
```
GET /triviabook/topic/science?difficulty=easy
```

**Example response** `200 OK`
```json
[
  {
    "id": 1,
    "topic": "science",
    "question": "What planet is known as the Red Planet?",
    "answer": "Mars",
    "difficulty": "easy"
  },
  {
    "id": 3,
    "topic": "science",
    "question": "What is the powerhouse of the cell?",
    "answer": "Mitochondria",
    "difficulty": "easy"
  }
]
```

**Errors**

| Status | When | Example |
|---|---|---|
| 404 | The topic doesn't exist | `{ "error": "Topic 'history' not found." }` |
| 400 | `limit` isn't a positive whole number | `{ "error": "limit must be a positive whole number." }` |
| 400 | `difficulty` isn't easy, medium, or hard | `{ "error": "difficulty must be easy, medium, or hard." }` |

---

### GET `/triviabook/random`

Returns one question chosen at random. The answer is not included.

**Example response** `200 OK`
```json
{
  "id": 4,
  "topic": "geography",
  "question": "What is the capital of Australia?",
  "difficulty": "medium"
}
```

**Errors**

| Status | When |
|---|---|
| 404 | There are no questions in the database |

---

### POST `/triviabook/answer`

Checks a guess against the correct answer. The comparison is case-insensitive and ignores leading and trailing whitespace.

**Request body** (JSON)

| Field | Required | Description |
|---|---|---|
| `id` | Yes | The question's id |
| `guess` | Yes | The guessed answer |

**Example request**
```json
{
  "id": 1,
  "guess": "  mars "
}
```

**Example response** `200 OK`
```json
{
  "id": 1,
  "guess": "  mars ",
  "correct": true,
  "answer": "Mars"
}
```

**Example response for a wrong guess** `200 OK`
```json
{
  "id": 5,
  "guess": "amazon",
  "correct": false,
  "answer": "The Nile"
}
```

**Errors**

| Status | When | Example |
|---|---|---|
| 400 | `id` or `guess` is missing | `{ "error": "Missing required field(s): guess." }` |
| 400 | `id` isn't a positive whole number | `{ "error": "id must be a positive whole number." }` |
| 404 | No question has that id | `{ "error": "No question found with id 9999." }` |

---

### POST `/triviabook/question/add`

Adds a new question. If the topic doesn't exist yet, it is created. Returns the updated list of questions for that topic.

**Request body** (JSON)

| Field | Required | Description |
|---|---|---|
| `topic` | Yes | Topic name (new or existing) |
| `question` | Yes | The question text |
| `answer` | Yes | The correct answer |
| `difficulty` | Yes | `easy`, `medium`, or `hard` |

**Example request**
```json
{
  "topic": "history",
  "question": "Who was the first US president?",
  "answer": "George Washington",
  "difficulty": "easy"
}
```

**Example response** `201 Created`
```json
[
  {
    "id": 6,
    "topic": "history",
    "question": "Who was the first US president?",
    "answer": "George Washington",
    "difficulty": "easy"
  }
]
```

**Errors**

| Status | When | Example |
|---|---|---|
| 400 | One or more required fields are missing or blank | `{ "error": "Missing required field(s): answer, difficulty." }` |
| 400 | `difficulty` isn't easy, medium, or hard | `{ "error": "difficulty must be easy, medium, or hard." }` |

---

## Testing

All endpoints were tested with the EchoAPI extension for VS Code, including each of the error cases listed above. After testing, run `npm run seed` to reset the database to the starter data.
