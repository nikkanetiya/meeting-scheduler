const initEnv = require('../config').initEnv;
initEnv();

const Firestore = require('@google-cloud/firestore');
module.exports = new Firestore();
