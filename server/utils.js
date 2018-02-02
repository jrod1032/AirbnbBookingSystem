const redisdb = require('../redisdb/test.js');
const elasticdb = require('../elasticdb/index.js');
const http = require('axios');

async function getSearchFromRedis(ctx, next) {
  let keyword = ctx.query.q;
  console.log('keyword', keyword)
  let data = await redisdb.getSearchResults(keyword);
  if (data) {
    ctx.body = data
  } else {
    return next()
  }
}

async function getSearchFromElastic (ctx, next) {
  let keyword = ctx.query.q;
  let listings = await elasticdb.searchKeyword(keyword)
  if (listings.hits.total) {
    redisdb.writeSearchToCache(listings.hits.hits, keyword)
     //format results for consistency with cache data shape
    let storage = {};
    listings.hits.hits.forEach( (listing) => {
      storage[listing._id] = listing._source.name 
    })

    ctx.body = storage;
  } else {
    ctx.body = "Sorry, no listing for that search"
  }

}

async function writeViewEventToEvents (ctx, next) {
  let listing = ctx.params.listing
  console.log('writing view event to events services with listing id', listing)
  return next();
}

async function getListingFromRedis (ctx, next) {
  let listing = ctx.params.listing

  let data = await redisdb.getListing(listing);
  if (data) {
    ctx.body = data
  } else {
    return next()
  }
}

async function getListingFromDB (ctx, next) {
  console.log('Fetching data from listings DB');
  let listing = ctx.params.listing;
  //call some function that asks listingDB for listing at that id 
  const myListing = {  
    id: '66159',
    name: 'Balanced Room in Lake Elisabethville',
    hostID: '98765',
    superBool: true
  }    
  //then...
  //redisdb.writeListingToCache(myListing)
  ctx.body = myListing;
}

async function sendBookingToBookings (ctx, next) {
  //expect an obj
  const exampleBooking = {
    id: 765433,
    name: 'Comfy Cambridge Home',
    hostID: '66159',
    superHost: true,
    user: 'Tom Brady',
    booking: {
      month: 'December',
      day: '26',
      year: '2018',
      timeStamp: Date.now()
    } 
  }

  http.post(bookingServiceURL + '/booking', {params: {listing: exampleBooking}})
      .then(response => {
        console.log('Sent to bookings!')
      })
      .catch(err => {
        console.error(err);
      })
}

module.exports.getSearchFromRedis = getSearchFromRedis
module.exports.getSearchFromElastic = getSearchFromElastic
module.exports.writeViewEventToEvents = writeViewEventToEvents
module.exports.getListingFromRedis = getListingFromRedis
module.exports.getListingFromDB = getListingFromDB
module.exports.sendBookingToBookings = sendBookingToBookings

