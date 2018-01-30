const redisdb = require('../redisdb/test.js')
const elasticdb = require('../elasticdb/index.js')

const Router = require('koa-router');
const router = Router({
  prefix: '/listings'
});

const searchResult = [{
    id:53323,
    title: 'Many pools!',
  },
  {
    id: 21123,
    title: 'Home near Franklin Park',
  },
  {
    id: 765433,
    title: 'Comfy Cambridge Home'
  }]

const myListing = {
  id: 21123,
  title: 'Home near Franklin Park',
  hostName: 'Mary Jane',
  superHost: true,
  city: 'Boston'
}  

const anotherListing = {
  id: 765433,
  title: 'Comfy Cambridge Home',
  hostName: 'Tom Brady',
  superHost: true,
  city: 'Boston'
}

async function goGetListingFromDB (ctx, next) {
  console.log('Fetching data from listings DB');
  //extract listing id from ctx
  let listing = ctx.params.listing;
  //call some function that asks listingDB for listing at that id 

  //then...
  redisdb.writeListingToCache(myListing)
  ctx.body = myListing;
}

async function goGetSearchFromElastic (ctx, next) {
  console.log('Fetching data from ElasticDB')
  //extract city search for from ctx
  let keyword = ctx.query.q;
  //call some function that asks elastic, get back results
   let listings = await elasticdb.searchKeyword(keyword)
   //data shape
   /*
    "hits": [
            {
              "_index": "airbnb",
              "_type": "listings",
              "_id": "2",
              "_score": 0.2876821,
              "_source": {
                "title": "Home near Franklin Park"
              }
            },
            {
              "_index": "airbnb",
              "_type": "listings",
              "_id": "1",
              "_score": 0.2876821,
              "_source": {
                "title": "Comfy Cambridge Home"
              }
            }
          ]
   */
  //redisdb.writeSearchToCache(listing.hits.hits, keyword)
  ctx.body = listings.hits.hits;
}

router.get('/search', async (ctx, next) => {
  let keyword = ctx.query.q;
  let data = await redisdb.getSearchResults(keyword);
  console.log('search results from cache', data);
  if (data) {
    ctx.body = data
  } else {
    return next()
  }
}, goGetSearchFromElastic);


router.get('/listing/:listing', async (ctx, next) => {
  console.log('params', ctx.params.listing)
  let listing = ctx.params.listing
  let data = await redisdb.getListing(listing);
  console.log('data: ', data)
  if (data) {
    ctx.body = data
  } else {
    console.log('Not in cache')
    return next()
  }

}, goGetListingFromDB);

module.exports = router;