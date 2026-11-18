require('dotenv').config({ quiet: true });
const express = require('express');
const triviaRoutes = require('./routes/triviaRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use('/triviabook', triviaRoutes);

app.listen(PORT, () => {
  console.log(`Trivia Book API running at http://localhost:${PORT}`);
});
