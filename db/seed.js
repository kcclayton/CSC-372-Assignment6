// Recreates the tables and loads the starter questions.
// Run with: npm run seed
const fs = require('fs');
const path = require('path');
const pool = require('./connection');

let topics = ['science', 'geography'];

let scienceQuestions = [
  { question: 'What planet is known as the Red Planet?', answer: 'Mars', difficulty: 'easy' },
  { question: 'What is the chemical symbol for gold?', answer: 'Au', difficulty: 'medium' },
  { question: 'What is the powerhouse of the cell?', answer: 'Mitochondria', difficulty: 'easy' }
];

let geographyQuestions = [
  { question: 'What is the capital of Australia?', answer: 'Canberra', difficulty: 'medium' },
  { question: 'Which river flows through Cairo?', answer: 'The Nile', difficulty: 'easy' }
];

const questionsByTopic = {
  science: scienceQuestions,
  geography: geographyQuestions
};

async function seed() {
  const client = await pool.connect();
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

    await client.query('BEGIN');
    await client.query(schema);

    for (const name of topics) {
      const { rows } = await client.query(
        'INSERT INTO topics (name) VALUES ($1) RETURNING id',
        [name]
      );
      const topicId = rows[0].id;

      for (const q of questionsByTopic[name]) {
        await client.query(
          `INSERT INTO questions (topic_id, question, answer, difficulty)
           VALUES ($1, $2, $3, $4)`,
          [topicId, q.question, q.answer, q.difficulty]
        );
      }
    }

    await client.query('COMMIT');

    const { rows } = await client.query(
      `SELECT t.name AS topic, COUNT(q.id)::int AS questions
       FROM topics t LEFT JOIN questions q ON q.topic_id = t.id
       GROUP BY t.name ORDER BY t.name`
    );
    console.log('Seed complete:');
    console.table(rows);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed, nothing was changed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
