var elasticsearch = require('elasticsearch');
const ELASTIC_PORT = process.env.ELASTIC_PORT
var client = new elasticsearch.Client({
  host: 'elasticsearch',
  log: 'trace'
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

function searchKeyword (keyword) {
  console.log('searching elastic:', keyword)
  return client.search({
    index: 'airbnb',
    type: 'listings',
    body: {
      query: {
        bool: {
          "must": [
                  {
                    "query_string": {
                      "default_operator": "AND",
                      "query": keyword,
                      "default_field": "name"
                    }
                  },
                  {
                    "exists": {
                      "field": "name"
                    }
                  }
                ],
   
        }
      }
    }
  })
} 

module.exports.searchKeyword = searchKeyword