// Create a a new random multiplication problem with limits.
function generateMultiplicationProblem(limitNumbers) {
  let num1, num2;

  // If limitNumbers is not provided, generate random numbers between 1 and 10
  if (!limitNumbers) {
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

// Create a new random multiplication problem with fractions.
function generateMultiplicationFractionProblem(limitNumbers) {
  // If limitNumbers is not provided or is an empty array, generate random numbers between 1 and 10
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


  const answer = (num1 * num3) + '/' + (num2 * num4);

  // Use math markdown now.
  // \[x = {-b \pm \sqrt{b^2-4ac} \over 2a}.\]
  return {
    num1: `\\(${num1} \\over ${num2}\\)`,
    num2: `\\(${num3} \\over ${num4}\\)`,
    answer
  };
}


// Create a new random fraction reducing problem.
// Reducing problem without improper fractions right now... add config var.
function generateFractionReducingProblem(limitNumbers) {
  // If limitNumbers is not provided or is an empty array, generate random numbers between 1 and 10

  // STEP 1: Create a properish fractions.
  let num1, num2;
  if (limitNumbers && limitNumbers.length > 0) {
    num1 = limitNumbers[Math.floor(Math.random() * limitNumbers.length)]; // picks random number in that list.
    num2 = limitNumbers[Math.floor(Math.random() * limitNumbers.length)];
  } else {
    num1 = Math.floor(Math.random() * 10) + 1; // Random number between 1 and 10
    num2 = Math.floor(Math.random() * 10) + 1;
  }

  // STEP 2: Make sure bottom is smaller number. proper fraction or 2/2.
  if (num1 > num2) {
    [num1, num2] = [num2, num1];
  }
  console.log(`DEBUG: num1: ${num1}, num2: ${num2}`);

  // STEP 3: Now multiply a fraction by a small number to make it bigger.
  const numX = Math.floor(Math.random() * 5) + 1;
  num1 = num1 * numX;
  num2 = num2 * numX;
  console.log(`DEBUG: num1: ${num1}, num2: ${num2}`);

  // STEP 4: Reduce to find actual answer.
  let gcd = function gcd(a, b) {
    return b ? gcd(b, a % b) : a;
  };
  const gcdValue = gcd(num1, num2);
  console.log("DEBUG: gcdValue: ", gcdValue)
  let num3 = num1 / gcdValue;
  let num4 = num2 / gcdValue;
  console.log(`DEBUG: num3: ${num3}, num4: ${num4}`);

  // STEP 5: Find final answer.
  // Plain ans no markdown.
  // TODO send both plain and markdown.
  // let answer = `\\(${num3} \\over ${num4}\\)`;
  let answer = `${num3}/${num4}`;
  if (num3 === num4) {
    answer = 1;
  }
  console.log(`DEBUG: answer:${answer}*`);

  // STEP 6: Create an explainer showing the work.
  let explainer = `Find the greatest common divisor (GCD) of ${num1} and ${num2}.  <br>The GCD is ${gcdValue}.  <br>`+
    `Divide both the numerator and denominator by the GCD to reduce the fraction to its simplest form. <br>`;
  if (answer === 1) {
    explainer = "The fraction has the same numerator and denominator, so it is equal to 1.";
  }
  // todo do already reduced ones.
  console.log("Explainer: ", explainer);

  // Use math markdown now.
  return {
    problem: `\\(${num1} \\over ${num2}\\)`,
    answer,
    explainer
  };
}

// Create a new find GCD problem.
function generateFindGCDProblem(limitNumbers) {
  // If limitNumbers is not provided or is an empty array, generate random numbers between 1 and 10

  // STEP 1: Find two random numbers
  let num1, num2;
  if (limitNumbers && limitNumbers.length > 0) {
    num1 = limitNumbers[Math.floor(Math.random() * limitNumbers.length)]; // picks random number in that list.
    num2 = limitNumbers[Math.floor(Math.random() * limitNumbers.length)];
  } else {
    num1 = Math.floor(Math.random() * 20) + 1; // Random number between 1 and 10
    num2 = Math.floor(Math.random() * 20) + 1;
  }

  // STEP 2: Make sure numbers arent same.
  if (num1 === num2) {
    num2 += 2;
  }
  console.log(`DEBUG: num1: ${num1}, num2: ${num2}`);

  // Multiple by a number to get a little bit larger...
  const numX = Math.floor(Math.random() * 5) + 1;
  num1 = num1 * numX;
  num2 = num2 * numX;
  console.log(`DEBUG: num1: ${num1}, num2: ${num2}`);


  // STEP 3: Find the GCD of the two numbers.
  let gcd = function gcd(a, b) {
    return b ? gcd(b, a % b) : a;
  };
  const gcdValue = gcd(num1, num2);
  let answer = gcdValue;
  console.log(`DEBUG: answer:${answer}*`);

  // STEP 4: Create an explainer showing the work.
  let explainer = `The largest number you can divide both ${num1} and ${num2} by is the greatest common divisor (GCD).  <br>` +
    `The GCD is ${gcdValue}.  <br>` +
    `${num1} divided by ${gcdValue} is ${num1 / gcdValue}.  <br>` +
    `${num2} divided by ${gcdValue} is ${num2 / gcdValue}.  <br>`;
  if (answer === 1) {
    explainer = "The numbers have no common divisors other than 1, so the GCD is 1.";
  }
  console.log("Explainer: ", explainer);

  // Use math markdown now.
  return {
    problem: `${num1} and ${num2}`,
    answer,
    explainer
  };
}

module.exports = {
  generateMultiplicationProblem, generateMultiplicationFractionProblem, generateFractionReducingProblem, generateFindGCDProblem
};