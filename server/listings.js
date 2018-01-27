const redisdb = require('../redisdb/test.js')

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
  console.log('Fetching data from listings');
  //extract listing id from ctx
  //call some function that asks listingDB for listing at that id 

  //then...
  redisdb.writeListingToCache(myListing)
  ctx.body = myListing;
}

async function goGetSearchFromElastic (ctx, next) {
  console.log('Fetching data from ElasticDB')
  //extract city search for from ctx
  var cityUserSearchedFor = 'Boston';
  console.log('searching for: ', cityUserSearchedFor);
  //call some function that asks elastic, get back results

  //then....
  redisdb.writeSearchToCache(searchResult, cityUserSearchedFor)
  ctx.body = searchResult;

}

router.get('/', async (ctx, next) => {
  let searchField = 'Boston';
  let data = await redisdb.getSearchResults(searchField);
  console.log('search results', data);
  if (data) {
    ctx.body = data
  } else {
    next()
  }
}, goGetSearchFromElastic);


router.get('/listing', async (ctx, next) => {
  let listing = '21123';
  let data = await redisdb.getListing(listing);
  console.log('data: ', data)
  if (data) {
    ctx.body = data
  } else {
    console.log('Not in cache')
    next()
  }

}, goGetListingFromDB);

module.exports = router;