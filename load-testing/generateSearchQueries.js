const faker = require('faker');

const generateRandomSearch = function(userContext, events, done) {
  const commonLocations = ['home', 'house', 'loft', 'apartment', 'flat', 'mansion', 'room'];
  const uncommonLocations = ['cave', 'tent', 'treehouse', 'boat'];
  const prepositions = ['in', 'near', 'close to'];

  function getRandomInt (max) {
    return Math.floor(Math.random() * Math.floor(max)); 
  }

  let myInt = 0
  let myLocation = null
  let myPreposition = prepositions[getRandomInt(prepositions.length)] 
  //weighted random location 
  let r = Math.random()
  if (r >= 0 && r < .8) {
    myInt = getRandomInt(commonLocations.length)
    myLocation = commonLocations[myInt]
  } else {
    myInt = getRandomInt(uncommonLocations.length)
    myLocation = uncommonLocations[myInt]
  }  
  userContext.vars.name = faker.fake(`${myLocation} ${myPreposition} {{address.city}}`)
  return done();
}

const generateSemiSearch = function(userContext, events, done) {
  const myChoice = Math.random();
  if (myChoice < .20) {
    generateRandomSearch(userContext, events, done);
  } else {
    const commonLocations = ['home', 'house', 'loft', 'apartment', 'flat', 'mansion', 'room'];
    const cities = ['Whiteport', 'Ricehaven', 'Ebonyfort', 'Arliefurt', 'Emilehaven', 'Lake Morseport', 'Port Evan', 'Pagacville', 'East Geovanny', 'South Twila', 'East Lilyport', 'Lake Kylie', 'Gulgowskishire', 'Kenya', 'Rohanmouth', 'Dudleyville', 'Jasper',];

    function getRandomInt (max) {
      return Math.floor(Math.random() * Math.floor(max)); 
    }

    let myCity = cities[getRandomInt(cities.length)] 
    let myLocation = commonLocations[getRandomInt(commonLocations.length)]


    userContext.vars.name = faker.fake(`${myLocation} in ${myCity}`)
    return done();
  }
}

module.exports.generateRandomSearch = generateRandomSearch
module.exports.generateSemiSearch = generateSemiSearch