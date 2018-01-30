var elasticsearch = require('elasticsearch');
var Bluebird = require('bluebird');
const ELASTIC_PORT = process.env.ELASTIC_PORT
var client = new elasticsearch.Client({
  host: ELASTIC_PORT,
  log: 'trace',
  defer: function () {
    // for older Bluebird
     return Bluebird.defer();

    // var resolve, reject;
    // var promise = new PromiseImpl(function() {
    //   resolve = arguments[0];
    //   reject = arguments[1];
    // });
    // return {
    //   resolve: resolve,
    //   reject: reject,
    //   promise: promise
    // };
  }
});


client.ping({
  requestTimeout: 1000
}, function (error) {
  if (error) {
    console.trace('elasticsearch cluster is down!');
  } else {
    console.log('All is well')
  }
});

// client.create({
//   index: 'searchResults',
//   type: 'listings',
//   body: {
//     title: 'Comfy Cambridge Home'
//   }
// })

function searchKeyword (keyword) {
  return client.search({
    index: 'airbnb',
    type: 'listings',
    body: {
      query: {
        fuzzy: {
          "title": {
            value: keyword,

          }
        }
      }
    }
  })
  //   .then( (body) => {
  //   let hits = body.hits.hits;
  //   console.log('hits: ', hits)
  // }, (error) => {
  //   console.log('error!', error.message);
  // });
  }

Bluebird.resolve()
  .then(searchKeyword)  

module.exports.searchKeyword = searchKeyword