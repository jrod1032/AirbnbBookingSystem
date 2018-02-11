const redisdb = require('../redisdb/index.js');
const elasticdb = require('../elasticdb/index.js');
const http = require('axios');

async function getSearchFromRedis(ctx, next) {
  try {
    let keyword = ctx.query.q;
    let data = await redisdb.getSearchResults(keyword);
    if (data) {
      ctx.body = data
    } else {
      return next()
    }
  } catch(err) {
    console.log('Error: ', err) 
  }
}

async function getSearchFromElastic (ctx, next) {
  try {
    let keyword = ctx.query.q;
    let listings = await elasticdb.searchKeyword(keyword)
    if (listings.hits.total) {
      redisdb.writeSearchToCache(listings.hits.hits, keyword)
       //format results for consistency with cache data shape
      let formattedListings = _formatData(listings.hits.hits);
      ctx.body = formattedListings;
    } else {
      ctx.body = "Sorry, no listing for that search"
    }
  } catch(err) {
    console.log('Error: ', err)
  }

}

async function getListingFromRedis (ctx, next) {
  try {
    let listingId = ctx.params.listing.toString()
    let listing = await redisdb.getListing(listingId);
    if (listing) {
      ctx.body = listing
      ctx.res.once('finish', () => {
        _writeViewEventToEvents(listing)
        _getBookingInfo(listing)
      })
    } else {
      return next()
    }
  } catch (err) {
    console.log('Error: ', err)
  }
}

async function getListingFromDB (ctx, next) {
  console.log('Fetching data from listings DB');
  let listingId = ctx.params.listing;

  try {
  // call to listings service

  /* 
  const listingServiceURL = 'http://listingService';
  let listing = await http.get(listingServiceURL + `/${listingId}`) 
  */

  // example listing retrieved for local testing

    const myListing = {
      "id":"9999999",
      "name":"sexy cave in Eddieside",
      "hostName":"Cyril Cormier",
      "superHost":"true"
    } 
      
    redisdb.writeListingToCache(myListing)
    ctx.body = myListing;
    ctx.res.once('finish', () => {
      _writeViewEventToEvents(myListing)
      _getBookingInfo(myListing)
    })
  } catch (err) {
    console.log('Error: ', err)
  }

}


function sendBookingToBookings (ctx, next) {
  const booking = ctx.params.listing
  const bookingServiceURL = 'http://bookingService';
  console.log('sending to Bookings')
  //http request to booking service


  // http.post(bookingServiceURL + '/booking', {params: {listing: ctx.params.listing}})
    ctx.response.status = 202;
    ctx.body = `Confirming booking of listing ${booking.id}`;
}

function _formatData (arrayOfObj) {
  let storage = {}
  arrayOfObj.forEach( (listing) => {
    storage[listing._id] = listing._source.name
  })
  return storage;
}

function _writeViewEventToEvents (listing) {
  console.log('writing view event to events services with listing id', listing)
}

function _getBookingInfo (listing) {
  console.log('get booking information for listing', listing)
  // http request to booking service

  // http.get(bookingServiceURL + '/booking', {params: {listing: listing}})
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
module.exports.getListingFromRedis = getListingFromRedis
module.exports.getListingFromDB = getListingFromDB
module.exports.sendBookingToBookings = sendBookingToBookings
//exporting for test purposes
module.exports._writeViewEventToEvents = _writeViewEventToEvents
module.exports._getBookingInfo = _getBookingInfo
module.exports._formatData = _formatData

