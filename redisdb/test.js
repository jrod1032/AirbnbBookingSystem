const redis = require('redis');
const bluebird = require('bluebird')
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const REDIS_PORT = process.env.REDIS_PORT
const client = redis.createClient(REDIS_PORT);

client.on("error", (err) => {
  console.log("Error " + err)
})

//client.hmset('listing:21123', 'title', 'Home near Franklin Park', 'hostName', 'MaryJane', 'superHost', true, 'city', 'Boston');
// client.hset('hash key', 'hashtest1', 'some value', redis.print);

function writeListingToCache (listing) {
  console.log('writing to cache: ', listing);
  client.hmset(listing.id.toString(), 'title', listing.title, 'hostName', listing.hostName, 'superHost', listing.superHost, 'city', listing.city)
}

function writeSearchToCache (searchResult, city) {
  searchResult.forEach( (result) => {
    /* NOTE: For each search result, we are storing id as key, and title as value
    We do this to optimize space, as opposed to having separate 'id' key to 
    store id. */
    client.hset(city, result.id, result.title)
  })
}

function getListing (listing) {
  return client.hgetallAsync(listing)
}

function getSearchResults (searchField) {
  return client.hgetallAsync(searchField);
}

module.exports.getListing = getListing;
module.exports.getSearchResults = getSearchResults;
module.exports.writeSearchToCache = writeSearchToCache;
module.exports.writeListingToCache = writeListingToCache;