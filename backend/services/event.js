const db = require('../db/store');
const moment = require('moment');

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

const listAvalilability = async () => {
  const collection = db.collection('slots'),
    result = [];

  const snapshot = await collection
    .where('available', '=', true)
    .orderBy('time', 'asc')
    .get();
  snapshot.forEach(doc => {
    result.push({ id: doc.id, ...doc.data() });
  });
  return result;
};

const addEvent = async data => {
  try {
    const collection = db.collection('events');

    data.startTime = new Date(data.startTime);
    data.startTime.setSeconds(0);

    data.endTime = new Date(
      data.startTime.getTime() + data.duration * 60 * 1000
    );

    const slotAvailable = await checkSlotAvailable(data.startTime);
    if (!slotAvailable) {
      return new Error('This slot is not available');
    }

    const doc = await collection.add(data);
    await markSlotNotAvailable(data.startTime, data.endTime);

    const docRef = await doc.get();
    return { id: docRef.id, ...docRef.data() };
  } catch (error) {
    // console.log(error.stack);
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
  listAvalilability,
  listEvents,
  checkEventsBetweenInterval
};
