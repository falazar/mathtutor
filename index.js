const express = require('express');
const app = express();
const path = require('path');

// Import all lesson types.
const {
  generateMultiplicationProblem,
  generateMultiplicationFractionProblem,
  generateFractionReducingProblem,
  generateFindGCDProblem
} = require('./src/mathProblems');
const {
  generateSpanishNumbersToEnglishProblem,
  generateSpanishNumbersToSpanishProblem
} = require('./src/spanishProblems');
const {
  generateUSStateProblem
} = require('./src/mapProblems');

const session = require('express-session');

// Read our .env variables.
require('dotenv').config();

// Connect to our db here. This is a global connection.
const {db, saveProblemsToDB} = require('./src/db');

app.use(session({
  secret: 'your secret key',
  resave: false,
  saveUninitialized: true
}));

// Set up EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set up body parsing middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Set up static files directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up body parsing middleware.
const bodyParser = require('body-parser');
const {generateEuropeCountriesProblem} = require("./src/mapEuropeProblems");
app.use(bodyParser.urlencoded({extended: true}));


function checkUserSession(req, res, next) {
  if (!req.session.userId) {
    res.redirect('/login');
  } else {
    next();
  }
}


// Hardcoded users for demonstration purposes
const users = {
  'falazar': {id: 1, password: 'fal1'},
  'lazarus': {id: 2, password: 'laz1'},
  'cyrus': {id: 3, password: 'cy1'},
};

// todo move me if working.
function queryDatabase(query, params) {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// General home page with all the lessons showing.
app.get('/', checkUserSession, async function (req, res) {
  // Grab some high scores from the db now.
  const query = `SELECT title, MAX(numQuestionsRight) as numQuestionsRight
                 FROM problem_sets
                 WHERE userId = ?
                   AND grade >= 70
                 GROUP BY title`;
  try {
    const results = await queryDatabase(query, [req.session.userId]);
    const values = results.map(result => Object.assign({}, result));

    res.render('index', {
      username: req.session.username,
      highScores: values
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while querying the database');
  }
});

app.get('/login', function (req, res) {
  res.render('login');
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (users[username] && users[username].password === password) {
    // Set the session variables
    req.session.username = username;
    req.session.userId = users[username].id;
    // req.session.firstName = 'John'; // Replace 'John' with the actual first name

    // Redirect to the index page
    res.redirect('/');
  } else {
    res.send('Invalid username or password');
  }
});

app.get('/logout', function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/login');
    }
  });
});

app.post('/saveProblems', checkUserSession, function (req, res) {
  saveProblemsToDB(req);
  res.json({message: 'Problems saved successfully'});
});

// MULTIPLICATION CHAPTER BEGIN
// Get starting multiplication problem.
app.post('/multiplication', checkUserSession, function (req, res) {
  const limitNumbers = req.body.limitNumbers ? req.body.limitNumbers.split(',').map(Number) : ''; // parse the numbers from the request body
  const problem = generateMultiplicationProblem(limitNumbers);

  Object.assign(req.session, {
    title: req.body.title,
    limitNumbers,
    problem: `${problem.num1} * ${problem.num2}`,
    answer: problem.answer,
    startTime: Date.now(), // Record the start time
    counters: {correct: 0, incorrect: 0, total: 0}, // reset
    logAnswers: [], // reset
  });

  const timer = req.body.timer || 0;
  res.render('problem_view', {
    username: req.session.username,
    title: req.body.title,
    problem: req.session.problem, counters: req.session.counters, timer, answerUrl: '/multiplication_answer',
    nextProblemUrl: '/multiplication_next_problem'
  });
});

// Call to get a new multiplication problem.
app.get('/multiplication_next_problem', checkUserSession, function (req, res) {
  const problem = generateMultiplicationProblem(req.session.limitNumbers);

  Object.assign(req.session, {
    problem: `${problem.num1} * ${problem.num2}`,
    answer: problem.answer,
    startTime: Date.now(), // Record the start time
  });

  // Return a JSON object with the new problem only.
  res.json({problem: req.session.problem});
});

// Checks answer for multiplication problem.
app.post('/multiplication_answer', checkUserSession, function (req, res) {
  const userAnswer = parseInt(req.body.answer, 10);
  const {result, correctAnswer, grade} = checkAnswerAndUpdateCounters(req, userAnswer);

  res.json({
    oldProblem: req.session.problem,
    result,
    correctAnswer,
    userAnswer,
    counters: req.session.counters,
    grade
  });
});

// todo move to new home.
// Given a request object and the user's answer, check the answer and update the counters.
function checkAnswerAndUpdateCounters(req, userAnswer) {
  const correctAnswer = req.session.answer;
  let result;
  if (userAnswer == correctAnswer) { // Type coerce to match.
    req.session.counters.correct++;
    result = 'Correct';
  } else {
    req.session.counters.incorrect++;
    result = 'Incorrect';
  }
  req.session.counters.total++;
  const grade = req.session.counters.correct / req.session.counters.total * 100;
  const timeTaken = Math.ceil((Date.now() - req.session.startTime) / 1000); // Calculate the time taken in seconds

  // Log each question.
  if (!req.session.logAnswers) {
    req.session.logAnswers = [];
  }
  req.session.logAnswers.push({problem: req.session.problem, correctAnswer, userAnswer, result, timeTaken});

  return {result, correctAnswer, grade};
}

// FRACTIONS CHAPTER BEGIN
// Get starting multiplication fraction problem.
app.post('/multiplication_fractions', checkUserSession, function (req, res) {
  const limitNumbers = req.body.limitNumbers ? req.body.limitNumbers.split(',').map(Number) : '';
  const problem = generateMultiplicationFractionProblem(limitNumbers);

  Object.assign(req.session, {
    title: req.body.title,
    limitNumbers,
    problem: `${problem.num1} * ${problem.num2}`,
    answer: problem.answer,
    startTime: Date.now(), // Record the start time
    counters: {correct: 0, incorrect: 0, total: 0}, // initialize
    logAnswers: [], // reset
  });

  const timer = req.body.timer || 0;
  res.render('problem_view', {
    username: req.session.username,
    title: req.body.title,
    problem: req.session.problem, counters: req.session.counters, timer, answerUrl: '/multiplication_fraction_answer',
    nextProblemUrl: '/multiplication_fraction_next_problem'
  });
});

// Call to get a new multiplication fraction problem.
app.get('/multiplication_fraction_next_problem', checkUserSession, function (req, res) {
  const problem = generateMultiplicationFractionProblem(req.session.limitNumbers);

  Object.assign(req.session, {
    problem: `${problem.num1} * ${problem.num2}`, // maybe move problem inside?
    answer: problem.answer,
    startTime: Date.now(), // Record the start time
  });
  console.log("DEBUG2: req.session.problem = ", req.session.problem);

  // Return a JSON object with the new problem only.
  res.json({problem: req.session.problem});
});

// Checks answer for multiplication fraction problem.
app.post('/multiplication_fraction_answer', checkUserSession, function (req, res) {
  const userAnswer = req.body.answer;
  const {result, correctAnswer, grade} = checkAnswerAndUpdateCounters(req, userAnswer);

  res.json({
    oldProblem: req.session.problem,
    result,
    correctAnswer,
    userAnswer,
    counters: req.session.counters,
    grade
  });
});


// Get starting fraction reducing problem.
app.post('/fractions_reducing', checkUserSession, function (req, res) {
  const limitNumbers = req.body.limitNumbers ? req.body.limitNumbers.split(',').map(Number) : ''; // parse the numbers from the request body
  const problem = generateFractionReducingProblem(limitNumbers);

  Object.assign(req.session, {
    title: req.body.title,
    limitNumbers,
    problem: problem.problem,
    answer: problem.answer,
    explainer: problem.explainer,
    startTime: Date.now(), // Record the start time
    counters: {correct: 0, incorrect: 0, total: 0}, // reset
    logAnswers: [], // reset
  });

  const timer = req.body.timer || 0;
  res.render('problem_view', {
    username: req.session.username,
    title: req.body.title,
    problem: req.session.problem,
    counters: req.session.counters,
    timer,
    answerUrl: '/fraction_reducing_answer',
    nextProblemUrl: '/fraction_reducing_next_problem'
  });
});

// Call to get a new multiplication fraction problem.
app.get('/fraction_reducing_next_problem', checkUserSession, function (req, res) {
  const problem = generateFractionReducingProblem(req.session.limitNumbers);

  Object.assign(req.session, {
    problem: problem.problem,
    answer: problem.answer,
    explainer: problem.explainer,
    startTime: Date.now(), // Record the start time
  });

  // Return a JSON object with the new problem only.
  res.json({problem: req.session.problem});
});

// Checks answer for multiplication fraction problem.
app.post('/fraction_reducing_answer', checkUserSession, function (req, res) {
  const userAnswer = req.body.answer;
  const {result, correctAnswer, grade} = checkAnswerAndUpdateCounters(req, userAnswer);

  res.json({
    oldProblem: req.session.problem,
    result,
    correctAnswer,
    userAnswer,
    explainer: req.session.explainer,
    counters: req.session.counters,
    grade
  });
});


// GCD CHAPTER BEGIN.
// Get start find GCD problem.
app.post('/find_gcd', checkUserSession, function (req, res) {
  const limitNumbers = req.body.limitNumbers ? req.body.limitNumbers.split(',').map(Number) : ''; // parse the numbers from the request body
  const problem = generateFindGCDProblem(limitNumbers);

  Object.assign(req.session, {
    title: req.body.title,
    limitNumbers,
    problem: problem.problem,
    answer: problem.answer,
    explainer: problem.explainer,
    startTime: Date.now(), // Record the start time
    counters: {correct: 0, incorrect: 0, total: 0}, // reset
    logAnswers: [], // reset
  });

  const timer = req.body.timer || 0;
  res.render('problem_view', {
    username: req.session.username,
    title: req.body.title,
    problem: req.session.problem,
    counters: req.session.counters,
    timer,
    answerUrl: '/find_gcd_answer',
    nextProblemUrl: '/find_gcd_next_problem'
  });
});

// Call to get a new find gcd problem.
app.get('/find_gcd_next_problem', checkUserSession, function (req, res) {
  const problem = generateFindGCDProblem(req.session.limitNumbers);

  Object.assign(req.session, {
    problem: problem.problem,
    answer: problem.answer,
    explainer: problem.explainer,
    startTime: Date.now(), // Record the start time
  });

  // Return a JSON object with the new problem only.
  res.json({problem: req.session.problem});
});

// Checks answer for gcd problem.
app.post('/find_gcd_answer', checkUserSession, function (req, res) {
  const userAnswer = req.body.answer;
  const {result, correctAnswer, grade} = checkAnswerAndUpdateCounters(req, userAnswer);

  res.json({
    oldProblem: req.session.problem,
    result,
    correctAnswer,
    userAnswer,
    explainer: req.session.explainer,
    counters: req.session.counters,
    grade
  });
});


// SPANISH CHAPTER BEGIN.
// TODO abstract this to handle more things? dunno.
// Numbers 1-10 from spanish to english.
app.post('/spanish_numbers_to_english', checkUserSession, function (req, res) {
  const problem = generateSpanishNumbersToEnglishProblem();

  Object.assign(req.session, {
    title: req.body.title,
    problem: problem.problem,
    answer: problem.answer,
    // could add voice wav as another field here.
    startTime: Date.now(), // Record the start time
    counters: {correct: 0, incorrect: 0, total: 0}, // reset
    logAnswers: [], // reset
  });

  const timer = req.body.timer || 0;
  res.render('problem_view', {
    username: req.session.username,
    title: req.body.title,
    problem: req.session.problem,
    counters: req.session.counters,
    timer,
    answerUrl: '/spanish_numbers_to_english_answer',
    nextProblemUrl: '/spanish_numbers_to_english_next_problem'
  });
});

// Call to get a new find spanish problem.
app.get('/spanish_numbers_to_english_next_problem', checkUserSession, function (req, res) {
  const problem = generateSpanishNumbersToEnglishProblem();

  Object.assign(req.session, {
    problem: problem.problem,
    answer: problem.answer,
    startTime: Date.now(), // Record the start time
  });

  // Return a JSON object with the new problem only.
  res.json({problem: req.session.problem});
});

// Checks answer for spanish problem.
app.post('/spanish_numbers_to_english_answer', checkUserSession, function (req, res) {
  const userAnswer = req.body.answer;
  const {result, correctAnswer, grade} = checkAnswerAndUpdateCounters(req, userAnswer);

  res.json({
    oldProblem: req.session.problem,
    result,
    correctAnswer,
    userAnswer,
    explainer: req.session.explainer,
    counters: req.session.counters,
    grade
  });
});


// Numbers 1-10 from english to spanish.
app.post('/spanish_numbers_to_spanish', checkUserSession, function (req, res) {
  const problem = generateSpanishNumbersToSpanishProblem();
  console.log("DEBUG: problem = ", problem);

  Object.assign(req.session, {
    title: req.body.title,
    problem: problem.problem,
    answer: problem.answer,
    // could add voice wav as another field here.
    startTime: Date.now(), // Record the start time
    counters: {correct: 0, incorrect: 0, total: 0}, // reset
    logAnswers: [], // reset
  });

  const timer = req.body.timer || 0;
  res.render('problem_view', {
    username: req.session.username,
    title: req.body.title,
    problem: req.session.problem,
    counters: req.session.counters,
    timer,
    answerUrl: '/spanish_numbers_to_spanish_answer',
    nextProblemUrl: '/spanish_numbers_to_spanish_next_problem'
  });
});

// Call to get a new find spanish problem.
app.get('/spanish_numbers_to_spanish_next_problem', checkUserSession, function (req, res) {
  const problem = generateSpanishNumbersToSpanishProblem();

  Object.assign(req.session, {
    problem: problem.problem,
    answer: problem.answer,
    startTime: Date.now(), // Record the start time
  });

  // Return a JSON object with the new problem only.
  res.json({problem: req.session.problem});
});

// Checks answer for spanish problem.
app.post('/spanish_numbers_to_spanish_answer', checkUserSession, function (req, res) {
  const userAnswer = req.body.answer;
  const {result, correctAnswer, grade} = checkAnswerAndUpdateCounters(req, userAnswer);

  res.json({
    oldProblem: req.session.problem,
    result,
    correctAnswer,
    userAnswer,
    explainer: req.session.explainer,
    counters: req.session.counters,
    grade
  });
});


app.post('/reset', checkUserSession, function (req, res) {
  req.session.counters = {correct: 0, incorrect: 0, total: 0};
  res.json({message: 'Counters reset successfully'});
});

// Show user page to see scores.
app.get('/scores', checkUserSession, function (req, res) {
  // HARDCODE only show kiddos scores right now.
  const limitUsers = ["lazarus", "cyrus"];
  const limitUsersString = limitUsers.map(user => `'${user}'`).join(", ");
  // have userId use that so no join needed.
  const query = `SELECT *, (numQuestionsRight * 10 - numQuestionsWrong * 5) as score
                 FROM problem_sets
                          JOIN users ON problem_sets.userId = users.id
                 WHERE users.username IN (${limitUsersString})
                 ORDER BY datetime DESC LIMIT 100`;
  let queryResults;
  db.query(query, (err, results) => {
    if (err) {
      throw err;
    }
    queryResults = results;

    res.render('scores', {
      username: req.session.username,
      scores: queryResults
    });
  });
});

// TEST PAGE ONLY.
app.get('/usa_map', checkUserSession, function (req, res) {
  res.render('usa_map',
    {
      username: req.session.username,
    });
});
app.get('/europe_map2', checkUserSession, function (req, res) {
  res.render('europe_map',
    {
      username: req.session.username,
    });
});

// MAPS CHAPTER BEGIN.
// TODO abstract this to handle more things? dunno.
// UNITED STATES MAP AREA
app.post('/us_states', checkUserSession, function (req, res) {
  const zone = req.body.zone;
  const problem = generateUSStateProblem(zone);
  console.log("DEBUG: problem = ", problem);

  Object.assign(req.session, {
    title: req.body.title,
    problem: problem.problem,
    answer: problem.answer,
    startTime: Date.now(), // Record the start time
    counters: {correct: 0, incorrect: 0, total: 0}, // reset
    logAnswers: [], // reset
    zone,
    options: problem.options,
  });

  const timer = req.body.timer || 0;
  res.render('problem_view', {
    username: req.session.username,
    title: req.body.title,
    problem: req.session.problem,
    map: "usa_map.ejs",
    counters: req.session.counters,
    timer,
    answerUrl: '/us_states_answer',
    nextProblemUrl: '/us_states_next_problem',
    zone,
    options: problem.options,
  });
});

// Call to get a new find state problem.
app.get('/us_states_next_problem', checkUserSession, function (req, res) {
  const problem = generateUSStateProblem(req.session.zone);

  Object.assign(req.session, {
    problem: problem.problem,
    answer: problem.answer,
    startTime: Date.now(), // Record the start time
  });

  // Return a JSON object with the new problem only.
  res.json({problem: req.session.problem});
});

// Checks answer for state problem.
app.post('/us_states_answer', checkUserSession, function (req, res) {
  const userAnswer = req.body.answer;
  const {result, correctAnswer, grade} = checkAnswerAndUpdateCounters(req, userAnswer);

  res.json({
    oldProblem: req.session.problem,
    result,
    correctAnswer,
    userAnswer,
    explainer: req.session.explainer,
    counters: req.session.counters,
    grade
  });
});


// EUROPE MAP AREA
app.post('/europe_countries', checkUserSession, function (req, res) {
  const zone = req.body.zone;
  const problem = generateEuropeCountriesProblem(zone);
  console.log("DEBUG: problem = ", problem);

  Object.assign(req.session, {
    title: req.body.title,
    problem: problem.problem,
    answer: problem.answer,
    startTime: Date.now(), // Record the start time
    counters: {correct: 0, incorrect: 0, total: 0}, // reset
    logAnswers: [], // reset
    zone,
    options: problem.options,
  });

  const timer = req.body.timer || 0;
  res.render('problem_view', {
    username: req.session.username,
    title: req.body.title,
    problem: req.session.problem,
    map: "europe_map.ejs",  // maybe change order of names here. map first?
    counters: req.session.counters,
    timer,
    answerUrl: '/europe_countries_answer',
    nextProblemUrl: '/europe_countries_next_problem',
    zone,
    options: problem.options,
  });
});

// Call to get a new find state problem.
app.get('/europe_countries_next_problem', checkUserSession, function (req, res) {
  const problem = generateEuropeCountriesProblem(req.session.zone);

  Object.assign(req.session, {
    problem: problem.problem,
    answer: problem.answer,
    startTime: Date.now(), // Record the start time
  });

  // Return a JSON object with the new problem only.
  res.json({problem: req.session.problem});
});

// Checks answer for state problem.
app.post('/europe_countries_answer', checkUserSession, function (req, res) {
  const userAnswer = req.body.answer;
  const {result, correctAnswer, grade} = checkAnswerAndUpdateCounters(req, userAnswer);

  res.json({
    oldProblem: req.session.problem,
    result,
    correctAnswer,
    userAnswer,
    explainer: req.session.explainer,
    counters: req.session.counters,
    grade
  });
});


app.get('/maze', function (req, res) {
  res.render('maze');
});

app.get('/dungeon', function (req, res) {
  res.render('dungeon');
});

app.listen(3000, function () {
  console.log('App is listening on port 3000!');
});



