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
  console.log('writing to cache a listing: ', listing);
  client.hmsetAsync(listing.id.toString(), 'id', listing.id, 'name', listing.name, 'hostID', listing.hostID, 'superBool', listing.superBool)
  .then()
  .catch((err) => {
    console.log('error writing listing to cache', err) 
  })
}

function writeSearchToCache (searchResult, query) {
    /* NOTE: For each search result, we are storing id as key, and title as value
    We do this to optimize cache space, as opposed to having separate 'id' key to 
    store id. */

  searchResult.forEach( (result) => {
    console.log('writing to cache search: ', result)
    client.hsetAsync(query, result._id, result._source.name)
  })
}

function getListing (listingID) {
  console.log('getting listing from cache')
  return client.hgetallAsync(listingID)
    // .then( (res) => console.log('is there a res?', res))
    // .catch( (err) => console.log('an error?', err))
}

function getSearchResults (searchField) {
  console.log('recovering search from cache')
  return client.hgetallAsync(searchField)
    // .then( (res) => console.log('is there a res?', res))
    // .catch( (err) => console.log('an error?', err))

}

module.exports.getListing = getListing;
module.exports.getSearchResults = getSearchResults;
module.exports.writeSearchToCache = writeSearchToCache;
module.exports.writeListingToCache = writeListingToCache;