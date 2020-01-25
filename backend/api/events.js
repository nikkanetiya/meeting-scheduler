const Boom = require('@hapi/boom');
const moment = require('moment');
const { jsonResponse, createEventPayload } = require('../libs/utils');
const globals = require('../config/globals');

const {
  addEvent,
  listEvents,
  listAvailableSlots
} = require('../services/event');

const { CreateEventSchema } = require('./schemas');

const getEvents = async (req, res, next) => {
  try {
    const list = await listEvents(req.query);
    res.send(jsonResponse(list));
  } catch (error) {
    // console.log(error.stack);
    next(Boom.badImplementation());
  }
};

const listAvailability = async (req, res, next) => {
  try {
    let { date } = req.query;

    if (!moment(date).isValid()) {
      return next(Boom.badRequest('Invalid date'));
    }
    const list = await listAvailableSlots(date);
    res.send(jsonResponse(list));
  } catch (error) {
    console.log(error.stack);
    next(Boom.badImplementation());
  }
};

const postEvent = async (req, res, next) => {
  try {
    const { error } = CreateEventSchema.validate(req.body);
    if (error) {
      return next(Boom.badRequest(error.message));
    }
    const data = req.body;
    const event = createEventPayload(data);

    // Must be future time
    if (event.startTime < new Date()) {
      return next(Boom.badData('Time cannot be older than current time'));
    }

    // Slot must be between 8AM to 5PM (Fixed for test purposes)
    if (
      event.minutes[0] < globals.startMinutes ||
      event.minutes[event.minutes.length - 1] > globals.endMinutes
    ) {
      return next(Boom.badData('Please select time between 8AM to 5PM'));
    }

    const result = await addEvent(event);
    if (result instanceof Error) {
      return next(Boom.badData(result.message));
    }
    res.send(jsonResponse(result));
  } catch (error) {
    console.log(error.stack);
    next(Boom.badImplementation());
  }
};

module.exports = {
  getEvents,
  postEvent,
  listAvailability
};
