const fs = require('fs');
const faker = require('faker');
//const file ='/exampleSearchData/exampleSearchData.json';
const file ='./redisDataTest.txt';
const {encode} = require('redis-proto');

var generateRandomListing = function(i) {
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
  let name = faker.fake(`{{company.bsAdjective}} ${myLocation} ${myPreposition} {{address.city}}`)
  let hostName = faker.fake('{{name.findName}}')
  let superHost = faker.fake('{{random.boolean}}')
  let schema = `HMSET ${i} id "${i}" name "${name}" hostName "${hostName}" superHost "${superHost}"`;
  return schema;
}

var iterationTime = function(stream, i) {
  let ok = true;
  do {
  let data = generateRandomListing(i)
    i--;
    if (i === 0) {
      console.log('last time');
      stream.write(data + '\n')
    } else {
      ok = stream.write(data + '\n')
    }
  } while (i > 0 && ok);
  if (i > 0) {
    //had to stop early!
    // console.log('all drained')
    stream.once('drain', () => iterationTime(stream, i))
  }
}

var generateCacheResults = function() {
  let i = 10000000
  const stream = fs.createWriteStream(file);
  stream.once('open', () => iterationTime(stream, i))

}
generateCacheResults();
