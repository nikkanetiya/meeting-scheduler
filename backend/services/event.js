const db = require('../db/store');
const moment = require('moment');
const {
  getMinutesArray,
  toChunks,
  checkArrayCollides
} = require('../libs/utils');
const globals = require('../config/globals');

const getMinutesFromMidnight = time => {
  midnight = time.startOf('day');
  return time.diff(midnight, 'minutes');
};

const minutesSinceMidnight = date => {
  return date.getHours() * 60 + date.getMinutes();
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
    let { startTime, endTime } = doc.data();
    result.push({ id: doc.id, startTime, endTime });
  });
  return result;
};

const listAvailableSlots = async date => {
  const collection = db.collection('events');

  let start,
    end,
    allMinutes = [];
  start = moment(date).startOf('day');
  end = moment(date).endOf('day');

  let snapshot = await collection
    .where('startTime', '>', start.toDate())
    .where('startTime', '<', end.toDate())
    .orderBy('startTime', 'asc')
    .get();

  snapshot.forEach(doc => {
    const { minutes } = doc.data();
    allMinutes = allMinutes.concat(minutes);
  });

  let now = moment(date).add(globals.startMinutes, 'minutes');
  let endOfWorkDay = moment(date).add(globals.endMinutes, 'minutes');
  let slots = [];

  while (now.isBefore(endOfWorkDay)) {
    const _start = now.clone();

    now.add(globals.duration, 'minutes').subtract(1, 'milliseconds');
    const _minutes = getMinutesArray(
      minutesSinceMidnight(_start.toDate()),
      minutesSinceMidnight(now.toDate())
    );
    const arrayCollide = checkArrayCollides(allMinutes, _minutes);
    now.add(1, 'milliseconds');

    if (!arrayCollide) {
      slots.push([_start.format(), now.format()]);
    }
  }
  return slots;
};

const checkEventExists = async (start, end) => {
  start = new Date(start);
  end = new Date(end);

  const startMinutesSinceMidnight = start.getHours() * 60 + start.getMinutes();
  const endMinutesSinceMidnight = end.getHours() * 60 + end.getMinutes();

  const minuteChunks = toChunks(
    getMinutesArray(startMinutesSinceMidnight, endMinutesSinceMidnight)
  );

  const collection = db.collection('events');
  for (let i = 0, len = minuteChunks.length; i < len; i++) {
    let snapshot1 = await collection
      .where('minutes', 'array-contains-any', minuteChunks[i])
      .get();

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
    const { startTime, endTime } = docRef.data();
    return { id: docRef.id, startTime, endTime };
  } catch (error) {
    console.log(error);
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

// (async () => {
//   let r = await listAvalilability('2020-01-22');
//   console.log(r);
// })();
module.exports = {
  addSlots,
  addEvent,
  checkEventExists,
  listAvailableSlots,
  listEvents,
  checkEventsBetweenInterval
};
