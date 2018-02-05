const {expect, should} = require('chai');
const chai = require('chai')
const sinonChai = require("sinon-chai");
const supertest = require('supertest');
const server = require('../server/index.js');
const router = require('../server/routes.js');
const utils = require('../server/utils.js')
const redisdb = require('../redisdb/index.js');


const mochaAsync = (fn) => {
    return async () => {
        try {
            await fn();
            return;
        } catch (err) {
          return
        }
    };
};

describe('Redis Cache functions', () => {

  it('should return search listings for a found hashing key', mochaAsync(async (done) => {
    try {
      let results = await redisdb.getSearchResults('mansion near Whiteport')
      expect(results).to.be.a('object');

    } catch(err) {
        done(err);
    }

  }));

  it('should return a listing for a found listing id key', mochaAsync(async (done) => {
    try {
      let listing = await redisdb.getListing('9999999') 
      expect(listing).to.be.an('object');
      expect(listing.name).to.equal('sexy cave in Eddieside');
      expect(listing).to.have.all.keys('id', 'name', 'hostName', 'superHost')
      done()
    } catch(err) {
      done(err);
    }
  }));

  it('should write listings with a given query hashing key', mochaAsync(async (done) => {
    const searchResult = [
      {'id': 1, '_source.name': 'Awesome Tom Brady mansion in Boston'}, 
      {'id': 2, '_source.name': 'Crummy Nick Foles apartment in Philly'}
    ]
    const query = 'superbowl qb houses';

    try {
      let confirmation = await redisdb.writeSearchToCache(searchResult, query);
      expect(confirmation).to.exist;
      let mySearchResult = await redisdb.getSearchResults(query);
      expect(mySearchResult).to.be.an('object')
      expect(mySearchResult['1']).to.equal(searchResult['1']);
      expect(mySearchResult['2']).to.equal(searchResult['2']);
      done()
    } catch(err) {
      done(err);
    }
  }));

  it('should write a listing with a given listing id key', mochaAsync(async (done) => {
    const listing = {
      "id":"exampleID",
      "name":"Awesome Tom Brady mansion in Boston",
      "hostName":"Tom Brady",
      "superHost":"true"
    }  
    try {
      let confirmation = await redisdb.writeListingToCache(listing);
      expect(confirmation).to.exist;
      let myListing = await redisdb.getListing(listing.id);
      expect(myListing).to.be.an('object');
      expect(myListing.name).to.equal(listing.name);
      expect(myListing.hostName).to.equal("Tom Brady")
      done()
    } catch(err) {
      done(err);
    }
  }));

  it('should format response from db to cache format for delivery', mochaAsync(async (done) => {
    const unformatted = [
        {
          "_index": "airbnb",
          "_type": "listings",
          "_id": "7290542",
          "_score": 16.471352,
          "_source": {
            "name": "Distributed house near Whiteport"
          }
        },
        {
          "_index": "airbnb",
          "_type": "listings",
          "_id": "8605220",
          "_score": 16.471352,
          "_source": {
            "name": "Mandatory house near Whiteport"
          }
        }, 
      ]
      let formattedData = utils._formatData(unformatted);
      expect(formattedData).to.be.an.object;
      expect(formattedData['7290542']).to.equal('Distributed house near Whiteport');
      expect(formattedData['8605220']).to.equal('Mandatory house near Whiteport');
  }))
  
});