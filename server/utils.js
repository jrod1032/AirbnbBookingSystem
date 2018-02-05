const redisdb = require('../redisdb/index.js');
const elasticdb = require('../elasticdb/index.js');
const http = require('axios');

async function getSearchFromRedis(ctx, next) {
  try{
    let keyword = ctx.query.q;
    console.log('keyword', keyword)
    let data = await redisdb.getSearchResults(keyword);
    if (data) {
      ctx.body = data
    } else {
      return next()
    }
  } catch(err) {
    console.log('some error', err) 
  }
}

async function getSearchFromElastic (ctx, next) {
  let keyword = ctx.query.q;
  let listings = await elasticdb.searchKeyword(keyword)
  if (listings.hits.total) {
    redisdb.writeSearchToCache(listings.hits.hits, keyword)
     //format results for consistency with cache data shape
    let formattedListings = _formatData(listings.hist.hits);
    ctx.body = formattedListings;
  } else {
    ctx.body = "Sorry, no listing for that search"
  }

}

function _formatData (arrayOfObj) {
  let storage = {}
  arrayOfObj.forEach( (listing) => {
    storage[listing._id] = listing._source.name
  })
  return storage;
}

async function writeViewEventToEvents (ctx, next) {
  let listing = ctx.params.listing
  console.log('writing view event to events services with listing id', listing)
   return next();
}

async function getListingFromRedis (ctx, next) {
  let listing = ctx.params.listing.toString()
  let data = await redisdb.getListing(listing);
  if (data) {
    ctx.body = data
    ctx.res.once('finish', _getBookingInfo)
  } else {
    return next()
  }
}

async function getListingFromDB (ctx, next) {
  console.log('Fetching data from listings DB');
  let listingId = ctx.params.listing;
  const listingServiceURL = 'http://listingService';
  // http.get(listingServiceURL + `/${listingId}`)
  //   .then( (res) => {
  //     //here we set body
  //     ctx.body = res
  //     ctx.res.once('finish', getBookingInfo)
  //   })
  //   .catch( (err) => {
  //     console.error(err)
  //   })
//for local testing

  const myListing = {
    "id":"9999999",
    "name":"sexy cave in Eddieside",
    "hostName":"Cyril Cormier",
    "superHost":"true"
  }   
  redisdb.writeListingToCache(myListing)
  ctx.body = myListing;
  ctx.res.once('finish', _getBookingInfo)
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

  const bookingServiceURL = 'http://bookingService';
  console.log('sending to Bookings')
  // http.post(bookingServiceURL + '/booking', {params: {listing: exampleBooking}})
  //     .then(response => {
  //       console.log('Sent to bookings!')
  //     })
  //     .catch(err => {
  //       console.error(err);
  //     })
  ctx.response.status = 201;
  ctx.body = `Confirming booking of listing ${exampleBooking.id}`;
}

async function _getBookingInfo () {
  console.log('get booking information for listing')
  // http.get(bookingServiceURL + '/booking', {params: {listingId: ctx.params.listing}})
  //   .then(response => {
  //     console.log(response)
  //        //should yield array of timeStamps
  //     ctx.body = response;
  //   })
  //   .catch(err => {
  //     console.error(err)
  //   })
}

module.exports.getSearchFromRedis = getSearchFromRedis
module.exports.getSearchFromElastic = getSearchFromElastic
module.exports.writeViewEventToEvents = writeViewEventToEvents
module.exports.getListingFromRedis = getListingFromRedis
module.exports.getListingFromDB = getListingFromDB
module.exports.sendBookingToBookings = sendBookingToBookings
//exporting for test purposes
module.exports._getBookingInfo = _getBookingInfo
module.exports._formatData = _formatData

