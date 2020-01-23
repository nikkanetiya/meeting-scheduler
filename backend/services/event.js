const db = require('../db/store');
const moment = require('moment');
const { getMinutesArray, toChunks } = require('../libs/utils');

const getMinutesFromMidnight = time => {
  midnight = time.startOf('day');
  return time.diff(midnight, 'minutes');
};

const checkSlotAvailable = async start => {
  const collection = db.collection('slots');
  const snapshot = await collection
    .where('time', '=', start)
    .where('available', '=', true)
    .get();

  return !snapshot.empty;
};

const markSlotNotAvailable = async (start, end) => {
  const collection = db.collection('slots');
  const snapshot = await collection
    .where('time', '>=', start)
    .where('time', '<', end)
    .where('available', '=', true)
    .get();

  snapshot.forEach(async doc => {
    const docRef = db.doc('slots/' + doc.id);
    await docRef.set({ available: false }, { merge: true });
  });
};

const checkEventsBetweenInterval = async (start, end) => {
  const collection = db.collection('events');
  const snapshot = await collection
    .where('startTime', '>', start)
    .where('startTime', '<', end)
    .get();
  return !snapshot.empty;
};

const listEvents = async queryArgs => {
  let start, end;
  // console.log(queryArgs);
  if (queryArgs.from && queryArgs.to) {
    start = moment(queryArgs.from)
      .startOf('day')
      .toDate();
    end = moment(queryArgs.to)
      .endOf('day')
      .toDate();

    // console.log(start, end);
  }

  const collection = db.collection('events'),
    result = [];

  let snapshot;
  if (start && end) {
    snapshot = await collection
      .where('startTime', '>', start)
      .where('startTime', '<', end)
      .orderBy('startTime', 'asc')
      .get();
  } else {
    snapshot = await collection.orderBy('startTime', 'asc').get();
  }
  snapshot.forEach(doc => {
    result.push({ id: doc.id, ...doc.data() });
  });
  return result;
};

const listAvalilability = async queryArgs => {
  const collection = db.collection('slots'),
    result = [];
  let start, end;
  if (queryArgs.date) {
    start = moment(queryArgs.date)
      .startOf('day')
      .toDate();
    end = moment(queryArgs.date)
      .endOf('day')
      .toDate();
  }
  let snapshot;
  if (start && end) {
    snapshot = await collection
      .where('available', '=', true)
      .where('time', '>', start)
      .where('time', '<', end)
      .orderBy('time', 'asc')
      .get();
  } else {
    snapshot = await collection
      .where('available', '=', true)
      .orderBy('time', 'asc')
      .get();
  }

  snapshot.forEach(doc => {
    result.push({ id: doc.id, ...doc.data() });
  });
  return result;
};

const checkEventExists = async (start, end) => {
  start = new Date(start);
  end = new Date(end);
  //console.log(start, end);
  const startMinutesSinceMidnight = start.getHours() * 60 + start.getMinutes();
  const endMinutesSinceMidnight = end.getHours() * 60 + end.getMinutes();

  const minuteChunks = toChunks(
    getMinutesArray(startMinutesSinceMidnight, endMinutesSinceMidnight)
  );
  //console.log(JSON.stringify(minuteChunks));
  const collection = db.collection('events');

  for (let i = 0, len = minuteChunks.length; i < len; i++) {
    let snapshot1 = await collection
      .where('minutes', 'array-contains-any', minuteChunks[i])
      .get();
    //console.log(snapshot1.empty === false, minuteChunks[i]);
    if (snapshot1.empty === false) return true;
  }
  return false;
};

const addEvent = async data => {
  try {
    const collection = db.collection('events');

    const eventExists = await checkEventExists(data.startTime, data.endTime);
    if (eventExists) {
      return new Error('This slot is not available');
    }

    const doc = await collection.add(data);
    const docRef = await doc.get();
    return { id: docRef.id, ...docRef.data() };
  } catch (error) {
    console.log(error.stack);
    throw error;
  }
};

const addSlots = async data => {
  const collection = db.collection('slots');
  let writeBatch = db.batch();
  for (let i in data) {
    writeBatch.set(collection.doc(), data[i]);
  }
  const writeResult = await writeBatch.commit();

  return writeResult;
};

module.exports = {
  addSlots,
  addEvent,
  checkEventExists,
  listAvalilability,
  listEvents,
  checkEventsBetweenInterval
};
