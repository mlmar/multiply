const { MongoClient } = require('mongodb');
const { MONGODB_CONNECTION_URI, MONGODB_NAME_DB } = process.env;

const _options = {};
let _client = null;
let _collections = {};

async function connect(init) {
  if(!_client) {
    console.log(MONGODB_CONNECTION_URI);
    _client = await (new MongoClient(MONGODB_CONNECTION_URI, _options)).connect();
    console.log('Connected to MongoDB');
  }
  return _client;
}

async function getDB() {
  const client = await connect();
  const db = await client.db(MONGODB_NAME_DB);
  return db;
}

async function getCollection(id) {
  const db = await getDB();
  if(!_collections[id]) {
    const collection = await db.collection(id);
    _collections[id] = collection;
  } 
  return _collections[id];  
};

module.exports = { connect, getDB, getCollection }