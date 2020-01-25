const moment = require('moment');
const request = require('supertest');
const app = require('../app');
const db = require('../db/store');

const validEventData = {
  startTime: moment()
    .set({ hour: 13, minute: 0, second: 0 })
    .format(),
  duration: 30
};

const invalidEventData = {
  startTime: moment()
    .set({ hour: 20, minute: 0, second: 0 })
    .format(),
  duration: 30
};

let event = {};

afterAll(async () => {
  // Delete the added event
  const document = db.doc(`events/${event.id}`);
  await document.delete();
});

describe('Event Endpoints', () => {
  it('Should be able to add event', async () => {
    const res = await request(app)
      .post('/events')
      .send(validEventData);
    expect(res.statusCode).toEqual(200);
    if (res.statusCode === 200) {
      event = res.body.data;
    }
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
      .send(validEventData);
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
