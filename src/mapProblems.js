// Make a list of all US States.
const states = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
  'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming'
];


const westernStates = ['Alaska', 'Hawaii', 'California', 'Oregon', 'Washington', 'Nevada', 'Idaho', 'Utah',
  'Arizona', 'Montana', 'Wyoming', 'Colorado', 'New Mexico', 'Texas', 'Oklahoma', 'Kansas', 'Nebraska', 'South Dakota','North Dakota'];

const easternStates = ['Maine', 'New Hampshire', 'Vermont', 'Massachusetts', 'Rhode Island', 'Connecticut', 'New York',
  'New Jersey', 'Pennsylvania', 'Delaware', 'Maryland', 'Virginia', 'West Virginia', 'North Carolina', 'South Carolina',
  'Georgia', 'Florida', 'Alabama', 'Mississippi', 'Missouri', 'Louisiana', 'Arkansas', 'Tennessee', 'Kentucky', 'Ohio', 'Indiana',
  'Illinois', 'Michigan', 'Wisconsin', 'Minnesota', 'Iowa']

// Create a new random us states problem.
function generateUSStateProblem(zone) {
  // Given a list of states, pick a random one.

  // TODO pass through question with proper wording for each too, to make nicer.

  let statesUse = states;
  if (zone === 'west') {
    statesUse = westernStates;
  } else if (zone === 'east') {
    statesUse = easternStates;
  }
  const pickNum = Math.floor(Math.random() * statesUse.length);
  const problem = statesUse[pickNum];
  const answer = statesUse[pickNum];

  return {
    problem,
    answer,
    options: statesUse
  }
}


module.exports = {
  generateUSStateProblem
};