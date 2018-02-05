const fs = require('fs');
const faker = require('faker');
const file ='./exampleSearchData/exampleSearchData.json';
//const file = '/data.json';

const generateRandomSearch = function(i) {
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
  let schema = {};
  let schema.name = faker.fake(`{{company.bsAdjective}} ${myLocation} ${myPreposition} {{address.city}}`)
  return schema;
}

const iterationTime = function(stream, i) {
  let ok = true;
  do {
  let data = JSON.stringify(generateRandomSearch(i));
  let index = JSON.stringify({_index: 'airbnb', _type: 'listings', '_id': i})
    i--;
    if (i === 0) {
      console.log('last time');
      stream.write(index + '\n')
      stream.write(data + '\n')
    } else {
      ok = stream.write(index + '\n')
      ok = stream.write(data + '\n')
    }
  } while (i > 0 && ok);
  if (i > 0) {
    //had to stop early!
    stream.once('drain', () => iterationTime(stream, i))
  }
}

const generateSearchResults = function() {
  let i = 10000000
  const stream = fs.createWriteStream(file);
  stream.once('open', () => iterationTime(stream, i))

}
generateSearchResults();