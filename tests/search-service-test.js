const {expect, should} = require('chai');
const chai = require('chai')
const sinonChai = require("sinon-chai");
const supertest = require('supertest');
const server = require('../server/index.js');
const router = require('../server/routes.js');
const utils = require('../server/utils.js')
const redisdb = require('../redisdb/test.js');
const elasticdb = require('../elasticdb/index.js');
const request = supertest('http://localhost:3000')
const sinon = require('sinon');

chai.use(sinonChai);
describe('Search Service Events', () => {

  const searchResults = [{
              "_index": "airbnb",
              "_type": "listings",
              "_id": "2",
              "_score": 0.2876821,
              "_source": {"title": "Home near Franklin Park"}
            },
            {
              "_index": "airbnb",
              "_type": "listings",
              "_id": "1",
              "_score": 0.2876821,
              "_source": {"title": "Comfy Cambridge Home"}
            }
          ]

  const listing = {  
    id: '4654566',
    name: 'Balanced Room in Lake Elisabethville',
    hostID: '98765',
    superBool: true
  }        

  describe('GET requests to /listings/search', () => {

    it('should respond with 200 status code', (done) => {
      request
        .get('/listings/search?q=home')
        .expect(200, done);
    });

    it('should return listings obj with key value pairs', (done) => {
       request
        .get('/listings/search?q=home')
        .then( (res) => {
          console.log('testresponse, ',res.body)
          expect(res.body).to.be.an('object');
          expect(res.body[1]).to.equal('Comfy Cambridge Home');
          done();
          });
    });

    it('should call Redis cache before ElasticDB', async (done) => {
      sinon.spy(redisdb, 'getSearchResults');
      sinon.spy(utils, 'getSearchFromElastic');
      const query = 'myHashForTesting'
       request
        .get(`/listings/search?q=${query}`)
        .then( (res) => {
          expect(redisdb.getSearchResults).to.have.been.calledWith(query);
          expect(utils.getSearchFromElastic).to.not.have.been.called;
          done()
        })
    });

    it('should call ElasticDB only if not found in cache', (done) => {
      sinon.spy(utils, 'getSearchFromElastic');
      const query = 'this query is too complicated to be in the cache';
       request
        .get(`/listings/search?q=${query}`)
        .then( (res) => {
          utils.getSearchFromElastic.restore()
          expect(utils.getSearchFromElastic).to.have.been.called
          done()
        })
    });

  });

  describe('RedisCache', () => {

    it('should return all listing data for a specified listing', async (done) => {
      // let answer = await redisdb.writeListingToCache(listing)
      try{
        
       let results = await redisdb.getListing(listing.id);
       expect(answer).to.exist;
       expect(results).to.be.an('object');
       expect(results).to.have.all.keys('id', 'name', 'hostID', 'superBool')
       done()
      } catch (e){
        console.log('error', e)

      }
    });

    it('should return search results for a specified query', async (done) => {
      try {
      const query = 'awesome people'
      // let answer = await redisdb.writeSearchToCache(results, query);
      let redisResults = await redisdb.getSearchResults(query);
      // expect(answer).to.exist;
      expect(redisResults).to.exist;
      expect(redisResults).to.be.an('object');
      expect(redisResults).to.eql(results)
      done()
      }
      catch(e) {
        console.log('error', e)
      }
    });

  });

  describe('GET requests to /listings/listing/:listingId', () => {

    it('should write view event to events service', (done) => {
      sinon.spy(utils, 'writeViewEventToEvents');
       request
        .get(`/listings/listing/${listing.id}`)
        .then( (res) => {
          expect(utils.writeViewEventToEvents).to.have.been.called
          utils.writeViewEventToEvents
        })
    });

    it('should return details of listing', (done) => {
       request
        .get(`/listings/listing/${listing.id}`)
        .then((res) => {
          expect(res.body).to.be.an('object');
          console.log('listingbody', res.body)
          expect(res.body.id).to.equal('4654566')
          done();
        })
    });

    it('should respond with 200 status code', (done) => {
      request
        .get('/listings/search?q=home')
        .expect(200, done)
    });

  });

  describe('POST request to /listings/listing/:listing', () => {

    it('should respond with a 201 status code', (done) => {
       request
        .post(`/listings/listing/${listing.id}`)
        .expect(201, done);
    });

    it('should send booking information to bookings service', (done) => {
      sinon.spy(utils, 'sendBookingToBookings');
       request
        .post(`/listings/listing/${listing.id}`)
        .expect(utils.sendBookingToBookings).to.have.been.called;
    });

  });

});