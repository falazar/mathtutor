// Createa a new random multiplication problem with limits.
function generateMultiplicationProblem(limitNumbers) {
  let num1, num2;

  // If limitNumbers is not provided or is an empty array, generate random numbers between 1 and 10
  if (!limitNumbers || limitNumbers.length === 0) {
    num1 = Math.floor(Math.random() * 10) + 1; // Random number between 1 and 10
    num2 = Math.floor(Math.random() * 10) + 1;
  } else {
    num1 = limitNumbers[Math.floor(Math.random() * limitNumbers.length)];
    num2 = Math.floor(Math.random() * 10) + 1;
  }
  // If Math.random() < 0.5 is true, switch num1 and num2
  [num1, num2] = Math.random() < 0.5 ? [num2, num1] : [num1, num2];

  const answer = num1 * num2;

  return {
    num1,
    num2,
    answer
  };
}

function generateMultiplicationFractionProblem(limitNumbers) {
  // If limitNumbers is not provided or is an empty array, generate random numbers between 1 and 10
  // if (!limitNumbers || limitNumbers.length === 0) {
  //     num1 = Math.floor(Math.random() * 10) + 1; // Random number between 1 and 10
  //     num2 = Math.floor(Math.random() * 10) + 1;
  // } else {
  //     num1 = limitNumbers[Math.floor(Math.random() * limitNumbers.length)];
  //     num2 = Math.floor(Math.random() * 10) + 1;
  // }
  // // If Math.random() < 0.5 is true, switch num1 and num2
  // [num1, num2] = Math.random() < 0.5 ? [num2, num1] : [num1, num2];

  // Create two properish fractions.
  let num1, num2, num3, num4;
  if (limitNumbers) {
    num1 = limitNumbers[Math.floor(Math.random() * limitNumbers.length)]; // picks random number in that list.
    num2 = limitNumbers[Math.floor(Math.random() * limitNumbers.length)];
    num3 = limitNumbers[Math.floor(Math.random() * limitNumbers.length)];
    num4 = limitNumbers[Math.floor(Math.random() * limitNumbers.length)];
  } else {
     num1 = Math.floor(Math.random() * 10) + 1; // Random number between 1 and 10
     num2 = Math.floor(Math.random() * 10) + 1;
     num3 = Math.floor(Math.random() * 10) + 1; // Random number between 1 and 10
     num4 = Math.floor(Math.random() * 10) + 1;
  }

  // Make sure bottom is smaller number.
  if (num1 > num2) {
    [num1, num2] = [num2, num1];
  }
  if (num3 > num4) {
    [num3, num4] = [num4, num3];
  }
  console.log(`DEBUG: num1: ${num1}, num2: ${num2}, num3: ${num3}, num4: ${num4}`);

  // todo add an explainer here too.

  // NOT reduced!

  // TODO reducing fractions also.

  // todo
  const answer = (num1 * num3) + '/' + (num2 * num4);

  return {
    num1: `${num1} / ${num2}`,
    num2: `${num3} / ${num4}`,
    answer
  };
}

module.exports = {
  generateMultiplicationProblem, generateMultiplicationFractionProblem
};