const express = require('express');
const app = express();
const path = require('path');
const {
  generateMultiplicationProblem,
  generateMultiplicationFractionProblem,
  generateFractionReducingProblem,
  generateFindGCDProblem
} = require('./src/mathProblems');
const session = require('express-session');

// Read our .env variables.
require('dotenv').config();

// Connect to our db here. This is a global connection.
const {db, saveProblemsToDB} = require('./db');

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

app.get('/', checkUserSession, function (req, res) {
  res.render('index', {
    username: req.session.username
  });
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
    counters: req.session.counters || {correct: 0, incorrect: 0, total: 0}, // Use existing counters or initialize if not present
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
  const correctAnswer = req.session.answer;

  let result;
  if (userAnswer === correctAnswer) {
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
  // console.log("DEBUG: Log answers = ", req.session.logAnswers);

  res.json({
    oldProblem: req.session.problem,
    result,
    correctAnswer,
    userAnswer,
    counters: req.session.counters,
    grade
  });
});

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
    counters: req.session.counters || {correct: 0, incorrect: 0, total: 0} // Use existing counters or initialize if not present
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
  const correctAnswer = req.session.answer;

  let result;
  if (userAnswer === correctAnswer) {
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
  // console.log("DEBUG: Log answers = ", req.session.logAnswers);

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
    counters: req.session.counters || {correct: 0, incorrect: 0, total: 0} // Use existing counters or initialize if not present
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
  const correctAnswer = req.session.answer;

  // todo make method here?
  let result;
  if (userAnswer == correctAnswer) { // cast both.
    req.session.counters.correct++;
    result = 'Correct';
  } else {
    req.session.counters.incorrect++;
    result = 'Incorrect';
  }
  console.log("DEBUG: result = ", result);
  req.session.counters.total++;
  const grade = req.session.counters.correct / req.session.counters.total * 100;

  const timeTaken = Math.ceil((Date.now() - req.session.startTime) / 1000); // Calculate the time taken in seconds

  // Log each question.
  if (!req.session.logAnswers) {
    req.session.logAnswers = [];
  }
  req.session.logAnswers.push({problem: req.session.problem, correctAnswer, userAnswer, result, timeTaken});
  // todo same stuff to here, in method.

  // console.log("DEBUG: Log answers = ", req.session.logAnswers);

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


// GCD CHAPTER BEING
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
    counters: req.session.counters || {correct: 0, incorrect: 0, total: 0} // Use existing counters or initialize if not present
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

// Checks answer for multiplication fraction problem.
app.post('/find_gcd_answer', checkUserSession, function (req, res) {
  const userAnswer = req.body.answer;
  const correctAnswer = req.session.answer;

  // todo make method here?
  let result;
  if (userAnswer == correctAnswer) { // cast both.
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
  // todo same stuff to here, in method.


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
  const query = 'SELECT * FROM problem_sets WHERE userId = ? ORDER BY datetime DESC';
  db.query(query, [req.session.userId], (err, results) => {
    if (err) {
      throw err;
    }
    res.render('scores',
      {
        username: req.session.username,
        scores: results
      });
  });
});

app.listen(3000, function () {
  console.log('App is listening on port 3000!');
});



