const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const mongoUtil = require('./util/MongoUtil.js');

app.use(cors({ origin: '*', credentials: true, optionsSuccessStatus: 200 }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

const { PORT, DEV, MONGODB_SCORES_COLLECTION } = process.env;

/*
global function to return all data in object format
status  : 0 = success, any other number is an error
data    : object
msg     : message string
*/
respond = (status, data, msg) => {
  const response = { status, data, msg };
  console.log(Date.now(), response);
  return response;
};

app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
  if(DEV) {
    console.log('RUNNING IN THE DEVELOPMENT');
  }
});

app.get('/scores', async function(req, res) {
  try {
    const scores = await getScores();
    res.send(respond(0, scores, 'Successfully retrieved scores'));
  } catch(e) {
    res.send(respond(1, null, 'Error retrieving scores'));
    console.log(e.stack);
  }
});



app.post('/insert', async function(req, res) {
  try {
    let { name, time, equations } = req.body;

    const hasName = name?.length > 0;
    const hasScore = parseFloat(time) > 1; // Should be almost impossible to be lower than 3
    const isEquationsCorrect = verifyEquations(equations);

    if(!hasName || !hasScore || !isEquationsCorrect) {
      throw new Error();
    }

    name = name.toUpperCase().substr(0,5) + '#' + randomId();

    const record = {
      name, 
      time, 
      equations
    }
    await insertScore(record);

    const scores = await getScores();
    const result = {
      record,
      scores
    }

    res.send(respond(0, result, 'Successfully posted score'));
  } catch(e) {
    res.send(respond(1, null, 'Error posting score'));
    console.log(e.stack);
  }
});


// Endpoints and helper functions
async function getScores() {
  const scoresCollection = await mongoUtil.getCollection(MONGODB_SCORES_COLLECTION);
  let scores = await scoresCollection.find({}).toArray();
  scores = scores.sort((a,b) => {
    return parseFloat(a.time) - parseFloat(b.time);
  }).map((score, i) => ({
    ...score,
    rank: i + 1
  }));
  return scores;
}

async function insertScore(data) {
  const scoresCollection = await mongoUtil.getCollection(MONGODB_SCORES_COLLECTION);
  const result = await scoresCollection.insertOne(data);
  return result;
}

function verifyEquations(equations) {
  let isCorrect = true;
  equations.forEach(function([a, b, c]) {
    if(!isCorrect) {
      return;
    }
    isCorrect = a * b === c;
  });
  return isCorrect;
}

function randomId() {
  const min = 1000;
  const max = 4000;
  return Math.floor(Math.random() * (max - min) + max);
}