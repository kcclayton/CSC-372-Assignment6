const triviaModel = require('../models/triviaModel');

const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

// call getAllTopics() and return an error if something goes wrong
async function getTopics(req, res) {

    try {

        // send triviaModel.getAllTopics() to res.json
        const topics = await triviaModel.getAllTopics();
        res.json({ topics });

    } catch (err) {

        // if this goes wrong, show this to the user
        console.error(err);
        res.status(500).json({ error: 'Something went wrong while getting topics.' });

    }

}

// call getTopicByName() and return an error if something goes wrong
async function getQuestionsByTopic(req, res) {

    try {

        // define constants
        const { topic } = req.params;
        let { limit, difficulty } = req.query;

        // check that user input is a topic that already exists
        const existingTopic = await triviaModel.getTopicByName(topic);
        if (!existingTopic) {
            return res.status(404).json({ error: `Topic '${topic}' not found.` });
        }
        
        // define limit if undefined
        if (limit !== undefined) {
            limit = Number(limit);
            if (!Number.isInteger(limit) || limit < 1) {
                return res.status(400).json({ error: 'Limit must be a positive whole number.' })
            }
        }

        // define difficulty if undefined
        if (difficulty !== undefined) {
            difficulty = difficulty.toLowerCase();
            if (!VALID_DIFFICULTIES.includes(difficulty)) {
                return res.status(400).json({ error: 'Difficulty must be easy, medium, or hard.' });
            }
        }

        const questions = await triviaModel.getQuestionsByTopic(topic, { limit, difficulty });
        res.json(questions);

    } catch (err) {

        console.error(err);
        res.status(500).json({ error: 'Something went wrong while getting questions.' });

    }

}

// call getRandomQuestion() and return an error if something goes wrong
async function getRandomQuestion(req, res) {

    try {

        // call getRandomQuestion() and return a message if there are no questions
        const question = await triviaModel.getRandomQuestion();
        if (!question) {
            return res.status(404).json({ error: 'There are no questions in the database yet.' });
        }
        res.json(question)

    } catch (err) {

        // return error message to user
        console.error(err);
        res.status(500).json({ error: 'Something went wrong while getting a random question.' });

    }
}

// call getQuestionById(), verify answer is appropriate, return an error if something goes wrong
async function checkAnswer(req, res) {

    try {

        // define id, guess
        const { id, guess } = req.body || {};

        // identify missing input from user
        const missing = [];
        if (id === undefined || id === null || id === '') missing.push('id');
        if (guess === undefined || guess === null) missing.push('guess');
        if (missing.length > 0) {
            return res.status(400).json({ error: `Missing required field(s): ${missing.join(', ')}.` });
        }

        // return error if input questionId is not an expected value
        const questionId = Number(id);
        if (!Number.isInteger(questionId) || questionId < 1) {
            return res.status(400).json({ error: 'ID must be a positive whole number.' });
        }

        // call getQuestionById
        const question = await triviaModel.getQuestionById(questionId);
        if (!question) {
            return res.status(404).json({ error: `No question found with id ${questionId}.` });
        }

        // tell a user whether their guess matches the correct answer
        const correct = String(guess).trim().toLowerCase() === question.answer.trim().toLowerCase();
        res.json({ id: questionId, guess, correct, answer: question.answer });

    } catch (err) {

        // return an error message to user
        console.error(err);
        res.status(500).json({ error: 'Something went wrong while checking the answer.' });

    }
}

// call addQuestion, check input, create new topic if needed, return error if something goes wrong
async function addQuestion(req, res) {

    try {

        // define topic, question, answer, difficulty
        const { topic, question, answer, difficulty } = req.body || {};

        // check for missing input from user
        const fields = { topic, question, answer, difficulty, };
        const missing = Object.keys(fields).filter ((key) => typeof fields[key] !== 'string' ||  fields[key] === '');
        if (missing.length > 0) {
            return res.status(400).json({ error: `Missing required field(s): ${missing.join(', ')}.` })
        }

        // check that input difficulty is valid
        const level = difficulty.trim().toLowerCase();
        if (!VALID_DIFFICULTIES.includes(level)) {
            return res.status(400).json({ error: 'Difficulty must be easy, medium, or hard.' });
        }

        // create topic if it does not already exist
        const topicName = topic.trim();
        let existingTopic = await triviaModel.getTopicByName(topicName);
        if (!existingTopic) {
            existingTopic = await triviaModel.createTopic(topicName);
            // potentially add verification step in case of typos?
        }

        // get input info for new question
        await triviaModel.addQuestion({
            topicId: existingTopic.id,
            question: question.trim(),
            answer: answer.trim(),
            difficulty: level
        });

        // show new question creation was successful
        const questions = await triviaModel.getQuestionsByTopic(topicName);
        res.status(201).json(questions);

    } catch (err) {

        // return error message to user
        console.error(err);
        res.status(500).json({ error: 'Something went wrong while adding the question.' });

    }

}

module.exports = {
    getTopics,
    getQuestionsByTopic,
    getRandomQuestion,
    checkAnswer,
    addQuestion,
};
