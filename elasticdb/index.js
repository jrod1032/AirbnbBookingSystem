var elasticsearch = require('elasticsearch');
const ELASTIC_PORT = process.env.ELASTIC_PORT
var client = new elasticsearch.Client({
  host: 'elasticsearch:9200',
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
                      // "cutoff_frequency": 0.001
                      // "analyze_wildcard": true
                    }
                  },
                  {
                    "exists": {
                      "field": "name"
                    }
                  }
                ],
          // "filter":  {
          //   "stop": {
          //     "type": "stop",
          //     "stopwords": ["near", "and", "the", "in", "close", "to"]
          //   }
          // }    
        }
      }
    }
  })
} 

module.exports.searchKeyword = searchKeyword