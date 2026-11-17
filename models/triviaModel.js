const pool = require('../db/connection');

// returns a list of all topics in the database
async function getAllTopics() {

    const result = await pool.query('SELECT name FROM topics ORDER BY name');
    return result.rows.map((row)=> row.name);

}

// returns a topic object with id and name if it exists, otherwise null
async function getTopicByName(name) {

    const result = await pool.query( 'SELECT id, name FROM topics WHERE name = LOWER($1)', [name] );
    return result.rows[0] || null;

}

// returns a list of questions for a given topic, optionally filtered by difficulty and limited in number
async function getQuestionsByTopic(topic, { limit, difficulty } = {}) {

    let sql = 'SELECT q.id, t.name AS topic, q.question, q.answer, q.difficulty FROM questions q JOIN topics t on t.id = q.topic_id WHERE t.name = LOWER($1)';
    const params = [topic];

    if (difficulty) {

        params.push(difficulty);
        sql += ' AND q.difficulty = $${params.length}';

    }

    sql += ' ORDER BY q.id';

    if (limit) {

        params.push(limit);
        sql += ' LIMIT $${params.length}';
        
    }

    const result = await pool.query(sql, params);
    return result.rows;


}

// returns a random question from the database with its topic and difficulty
async function getRandomQuestion() {

    const result = await pool.query('SELECT q.id, t.name AS topic, q.question, q.difficulty FROM questions q JOIN topics t ON t.id = q.topic_id ORDER BY RANDOM() LIMIT 1');
    return result.rows[0] || null;

}

// returns a question object with id, question, answer, and difficulty if it exists, otherwise null
async function getQuestionById(id) {

    const result = await pool.query('SELECT id, question, answer, difficulty FROM questions WHERE id = $1', [id]);
    return result.rows[0] || null;

}

module.exports = {
    getAllTopics,
    getTopicByName,
    getQuestionsByTopic,
    getRandomQuestion,
    getQuestionById
};
