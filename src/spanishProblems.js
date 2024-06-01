// Make a tuple list of english and spanish numbers.
const spanishEnglishNumbers = [
  {english: 'one', spanish: 'uno'},
  {english: 'two', spanish: 'dos'},
  {english: 'three', spanish: 'tres'},
  {english: 'four', spanish: 'cuatro'},
  {english: 'five', spanish: 'cinco'},
  {english: 'six', spanish: 'seis'},
  {english: 'seven', spanish: 'siete'},
  {english: 'eight', spanish: 'ocho'},
  {english: 'nine', spanish: 'nueve'},
  {english: 'ten', spanish: 'diez'}
];


// Create a new random spanish numbers problem.
function generateSpanishNumbersToSpanishProblem(limitNumbers) {
  // Given a list of spanish terms, pick a random one.

  // TODO in future these lists will all come from db.
  // Just need to set a query call here.

  const pickNum = Math.floor(Math.random() * spanishEnglishNumbers.length);
  const problem = spanishEnglishNumbers[pickNum].english;
  const answer = spanishEnglishNumbers[pickNum].spanish;

  return {
    problem,
    answer
  };
}

// Create a new random spanish numbers problem.
function generateSpanishNumbersToEnglishProblem(limitNumbers) {
  // Given a list of spanish terms, pick a random one, return both languages word.

  // TODO in future these lists will all come from db.
  // Just need to set a query call here.

  const pickNum = Math.floor(Math.random() * spanishEnglishNumbers.length);
  const problem = spanishEnglishNumbers[pickNum].spanish;
  const answer = spanishEnglishNumbers[pickNum].english;

  return {
    problem,
    answer
  };
}


module.exports = {
  generateSpanishNumbersToSpanishProblem,
  generateSpanishNumbersToEnglishProblem
};