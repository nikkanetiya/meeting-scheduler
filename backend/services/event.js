import db from '../db/store';

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

export const listEvents = async () => {
  const collection = db.collection('events'),
    result = [];

  const snapshot = await collection.orderBy('startTime', 'asc').get();
  snapshot.forEach(doc => {
    result.push({ id: doc.id, ...doc.data() });
  });
  return result;
};

export const listAvalilability = async () => {
  const collection = db.collection('slots'),
    result = [];

  const snapshot = await collection
    .where('available', '=', true)
    .orderBy('time', 'asc')
    .get();
  snapshot.forEach(doc => {
    result.push(doc.data());
  });
  return result;
};

export const addEvent = async data => {
  const collection = db.collection('events');

  data.startTime = new Date(data.startTime);
  data.startTime.setSeconds(0);

  data.endTime = new Date(data.startTime.getTime() + data.duration * 59 * 1000);
  data.endTime.setSeconds(59);

  const slotAvailable = await checkSlotAvailable(data.startTime);
  console.log('[addEvent] slotAvailable:', slotAvailable);
  if (!slotAvailable) {
    return new Error('This slot is not available');
  }

  const doc = await collection.add(data);
  await markSlotNotAvailable(data.startTime, data.endTime);

  const docRef = await doc.get();
  return { id: docRef.id, ...docRef.data() };
};

export const addSlots = async data => {
  const collection = db.collection('slots');
  let writeBatch = db.batch();
  for (let i in data) {
    writeBatch.set(collection.doc(), data[i]);
  }
  const writeResult = await writeBatch.commit();

  return writeResult;
};
