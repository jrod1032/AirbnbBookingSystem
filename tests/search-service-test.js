const {expect, should} = require('chai');
const chai = require('chai')
const sinonChai = require("sinon-chai");
const supertest = require('supertest-koa-agent');
const server = require('../server/index.js');
// const router = require('../server/routes.js');
const utils = require('../server/utils.js')
const redisdb = require('../redisdb/index.js');
const elasticdb = require('../elasticdb/index.js');
const request = supertest(server);
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
    "id":"9999999",
    "name":"sexy cave in Eddieside",
    "hostName":"Cyril Cormier",
    "superHost":"true"
  }    

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

  describe('GET requests to /listings/search', () => {

    it('should respond with 200 status code', (done) => {
      request
        .get('/listings/search?q=mansion+near+Whiteport')
        .expect(200, done);
    });

    it('should return search results obj with key value pairs', (done) => {
       request
        .get('/listings/search?q=mansion+near+Whiteport')
        .then( (res) => {
          expect(res.body).to.be.an('object');
          expect(res.body["3059026"]).to.equal('Down-sized mansion near Whiteport');
          done();
          });
    });

    it('should call Redis cache before ElasticDB', mochaAsync(async (done) => {
      sinon.spy(redisdb, 'getSearchResults');
      sinon.spy(utils, 'getSearchFromElastic');
      const query = 'myHashForTesting'
       request
        .get(`/listings/search?q=${query}`)
        expect(redisdb.getSearchResults).to.have.been.calledWith(query);
        expect(utils.getSearchFromElastic).to.not.have.been.called;


    }));

    it('should retrieve results from ES in under 200ms', (done) => {
      const query = 'mansion+near+Whiteport';
      request
        .get(`/listings/search?q=${query}`)
        .then( (res) => {
          expect(parseInt(res.header['x-response-time'])).to.be.below(200)
          done()
        })
    })

  });

  describe('GET requests to /listings/listing/:listingId',() => {

    it('should write view event to events service', mochaAsync(async (done) => {
       sinon.stub(utils, 'writeViewEventToEvents');
       request
        .get(`/listings/listing/${listing.id}`)
        .expect(utils.writeViewEventToEvents).to.have.been.called         
    }));

    it('should get booking info for called listing', mochaAsync(async (done) => {
       sinon.stub(utils, '_getBookingInfo');
       request
        .get(`/listings/listing/${listing.id}`)
        .expect(utils._getBookingInfo).to.have.been.called         
    }));


    it('should return details of listing in under 20 ms', mochaAsync(async (done) => {
      sinon.spy(utils, 'getListingFromRedis');
       request
        .get(`/listings/listing/${listing.id}`)
        .then((res) => {
          expect(res.body).to.be.an('object');
          expect(utils.getListingFromRedis.to.have.been.called)
          expect(res.body.name).to.equal('sexy cave in Eddieside')
          expect(parseInt(res.header['x-response-time'])).to.be.below(20)
          done();
        })
    }));

    it('should respond with 200 status code', (done) => {
      request
        .get('/listings/listing/${listing.id}`')
        .expect(200, done)
    });

  });

  describe('POST request to /listings/booking/:listing', () => {

    it('should respond with a 201 status code', (done) => {
       request
        .post(`/listings/booking/${listing.id}`)
        .expect(201, done);
    });

    it('should send booking information to bookings service', mochaAsync( async (done) => {
      sinon.spy(utils, 'sendBookingToBookings');
       request
        .post(`/listings/booking/${listing.id}`)
        .expect(utils.sendBookingToBookings).to.have.been.called;

    }));

  });

});