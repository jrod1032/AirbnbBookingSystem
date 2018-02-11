const fs = require('fs');
const file ='./realData/realData20.json';
const csv = require('csvtojson');
const csvFilePath = './listingData/listings20.txt'

const generateSearchResults = function() {
  let i = 10000000
  const stream = fs.createWriteStream(file);
  stream.once('open', () => convert(stream))
}

const convert = function(stream) {
  csv()
    .fromFile(csvFilePath)
    .on('json', (listing) => {
      let index = JSON.stringify({index: {_index: 'airbnb', _type: 'listings', '_id': listing.listingId}});
      let data = JSON.stringify({name: listing.name});
      stream.write(index + '\n')
      stream.write(data + '\n')
    })
    .on('done', (error) => {
      console.log('end')
    })
}

generateSearchResults()
// { listingId: '76d023e4-077a-4380-b88e-190cdca4669d',
//   hostId: 'fa3cb0ad-9255-4a81-8752-2c677f12ea59',
//   name: 'Team-oriented Apartment in New Shirley',
//   superBool: 'false' }
// { listingId: '3132af74-5192-490f-b285-c7b6580df83f',
//   hostId: 'dbf5bdb2-18ae-4620-a60e-d588c458296d',
//   name: 'Multi-channelled Villa in Osinskichester',
//   superBool: 'false' }
// { listingId: '68123651-07b3-47d0-8db5-e4db4f879f77',
//   hostId: 'b740419a-57a1-4eeb-b2e0-a6df25db8760',
//   name: 'Persistent Flat in Lake Cindy',
//   superBool: 'false' }

