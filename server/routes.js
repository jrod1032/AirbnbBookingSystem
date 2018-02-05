const utils = require('./utils.js');
const Router = require('koa-router');
const router = Router({
  prefix: '/listings'
});

router.get('/search', 
  utils.getSearchFromRedis, 
  utils.getSearchFromElastic);

router.get('/listing/:listing', 
  utils.writeViewEventToEvents,
  utils.getListingFromRedis, 
  utils.getListingFromDB
  );

router.post('/booking/:listing', 
  utils.sendBookingToBookings)

module.exports = router;