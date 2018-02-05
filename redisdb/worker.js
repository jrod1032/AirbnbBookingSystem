const redis = require('redis');
// const bluebird = require('bluebird')
// bluebird.promisifyAll(redis.RedisClient.prototype);
// bluebird.promisifyAll(redis.Multi.prototype);

const REDIS_QUEUE_PORT = 'http://127.0.0.1:6380';
const REDIS_PORT = process.env.REDIS_PORT

const sub = redis.createClient(REDIS_QUEUE_PORT);
const client = redis.createClient(REDIS_PORT)

sub.on("error", (err) => {
  console.log("Error " + err)
})

sub.on("message", function (channel, message) {
    console.log("sub channel " + channel + ": " + message);
    if (channel === "addedListings") {
    //client.hmsetAync(message.id.toString(), 'id', listing.id, 'name', listing.name, 'hostID', listing.hostID, 'superBool', listing.superBool)
    }
    if (channel === 'bookingDates') {
         console.log('send data to client who asked for it')
      //somehow send back array of dates to client, oh and also i need to know what id this was
    }
});

sub.subscribe("addedListings");
sub.subscribe('bookingDates')