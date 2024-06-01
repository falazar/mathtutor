const mysql = require('mysql');
const uuid = require('uuid');

const db = mysql.createConnection({
  host: 'mysql.falazar.com',
  user: 'falazar',
  password: process.env.DB_PASSWORD,
  database: 'tutorbot'
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to database');
});

// Saves a set of problems to the database.
function saveProblemsToDB(req) {
  const logAnswers = req.session.logAnswers;
  const runId = uuid.v4(); // Generate a new UUID for each set of problems

  // STEP 1: Save array of tries to db now.
  // Create an array to hold the values for all problems
  let values = [];
  // Iterate over logAnswers and push the values for each problem into the array
  logAnswers.forEach((logAnswer) => {
    const {problem, correctAnswer, userAnswer, result, timeTaken} = logAnswer;
    values.push([req.session.userId, runId, req.session.title, problem, correctAnswer, userAnswer, result, timeTaken]);
  });
  // Create a placeholder string for the query
  let placeholders = values.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(',');
  // Construct the query
  let query = `INSERT INTO problems_tried (userId, runId, title, problem, correctAnswer, userAnswer, result, timeTaken)
               VALUES ${placeholders}`;
  // Flatten the values array
  values = [].concat(...values);
  // Execute the query
  db.query(query, values, (err, result) => {
    if (err) {
      throw err;
    }
    console.log('Problems saved to database');
  });

  // STEP 2: Save the result set now.
  const numQuestionsRight = logAnswers.filter(logAnswer => logAnswer.result === 'Correct').length;
  const numQuestionsWrong = logAnswers.length - numQuestionsRight;
  const grade = Math.round((numQuestionsRight / logAnswers.length) * 100);
  query = `INSERT INTO problem_sets (runId, userId, title, grade, numQuestionsRight, numQuestionsWrong, datetime)
           VALUES (?, ?, ?, ?, ?, ?, NOW())`;
  values = [runId, req.session.userId, req.session.title, grade, numQuestionsRight, numQuestionsWrong];
  db.query(query, values, (err, result) => {
    if (err) {
      throw err;
    }
    console.log('Problem set saved to database');
  });
}


module.exports = {
  db,
  saveProblemsToDB
}