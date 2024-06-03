// Make a list of all Europe Countries.
const countries = [
  'Albania', 'Andorra', 'Armenia', 'Austria', 'Azerbaijan', 'Belarus', 'Belgium', 'Bosnia and Herzegovina',
  'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Georgia',
  'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Kazakhstan', 'Kosovo', 'Latvia', 'Liechtenstein',
  'Lithuania', 'Luxembourg', 'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands', 'North Macedonia', 'Norway',
  'Poland', 'Portugal', 'Romania', 'Russia', 'San Marino', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden',
  'Switzerland', 'Turkey', 'Ukraine', 'United Kingdom', 'Vatican City'
];  // todo check all these.


// TODO
const westernCountries = ['Alaska', 'Hawaii', 'California', 'Oregon', 'Washington', 'Nevada', 'Idaho', 'Utah',
  'Arizona', 'Montana', 'Wyoming', 'Colorado', 'New Mexico', 'Texas', 'Oklahoma', 'Kansas', 'Nebraska', 'South Dakota','North Dakota'];

const easternCountries = ['Maine', 'New Hampshire', 'Vermont', 'Massachusetts', 'Rhode Island', 'Connecticut', 'New York',
  'New Jersey', 'Pennsylvania', 'Delaware', 'Maryland', 'Virginia', 'West Virginia', 'North Carolina', 'South Carolina',
  'Georgia', 'Florida', 'Alabama', 'Mississippi', 'Missouri', 'Louisiana', 'Arkansas', 'Tennessee', 'Kentucky', 'Ohio', 'Indiana',
  'Illinois', 'Michigan', 'Wisconsin', 'Minnesota', 'Iowa']

// Create a new random us states problem.
function generateEuropeCountriesProblem(zone) {
  // Given a list of countries, pick a random one.

  // TODO pass through question with proper wording for each too, to make nicer.

  let countriesUse = countries;
  if (zone === 'west') {
    countriesUse = westernCountries;
  } else if (zone === 'east') {
    countriesUse = easternCountries;
  }
  const pickNum = Math.floor(Math.random() * countriesUse.length);
  const problem = countriesUse[pickNum];
  const answer = countriesUse[pickNum];

  return {
    problem,
    answer,
    options: countriesUse
  }
}


module.exports = {
  generateEuropeCountriesProblem
};