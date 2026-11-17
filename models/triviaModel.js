const pool = require('../db/connection');

// returns ['geography', 'science', etc...]
async function getAllTopics() {

    const result = await pool.query('SELECT name FROM topics ORDER BY name');
    return result.rows.map((row)=> row.name);

}

async function getTopicByName(name) {
    const resut = await pool.query( 'SELECT id, name FROM topics WHERE name = LOWER($1)', [name] );
}

module.exports = {
    getAllTopics
};
