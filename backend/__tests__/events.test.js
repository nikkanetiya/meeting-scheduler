const moment = require('moment');
const request = require('supertest');
const app = require('../app');
const db = require('../db/store');
const slotsData = {
  start: moment()
    .add(1, 'hour')
    .set({ minute: 0, second: 0 })
    .format(),
  end: moment()
    .add(2, 'hour')
    .set({ minute: 0, second: 0 })
    .format(),
  duration: 30
};

const validEventData = {
  startTime: moment()
    .add(1, 'hour')
    .set({ minute: 0, second: 0 })
    .format(),
  duration: 30
};

const invalidEventData = {
  startTime: moment()
    .subtract(1, 'hour')
    .set({ minute: 0, second: 0 })
    .format(),
  duration: 30
};

const potentialInvalidEventSlot = {
  startTime: moment()
    .add(10, 'minute')
    .format(),
  duration: 30
};

beforeAll(() => {
  db.collection('events')
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(documentSnapshot => {
        documentSnapshot.ref.delete().then(() => {});
      });
    });

  db.collection('slots')
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(documentSnapshot => {
        documentSnapshot.ref.delete().then(() => {});
      });
    });
});

describe('Event Endpoints', () => {
  it('Should be able to add slots', async () => {
    const res = await request(app)
      .post('/events/availability')
      .send(slotsData);
    expect(res.statusCode).toEqual(200);
  });

  it('Should be able to add event within added slot range', async () => {
    const res = await request(app)
      .post('/events')
      .send(validEventData);
    expect(res.statusCode).toEqual(200);
  });

  it('Should not add event outside of added slot range', async () => {
    const res = await request(app)
      .post('/events')
      .send(invalidEventData);
    expect(res.statusCode).toEqual(422);
  });

  it('Should return HTTP:422 when slot is not available', async () => {
    const res = await request(app)
      .post('/events')
      .send(potentialInvalidEventSlot);
    expect(res.statusCode).toEqual(422);
  });

  it('Should return event list', async () => {
    const res = await request(app).get('/events');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('Should return available slot list', async () => {
    const res = await request(app).get('/events/availability');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
