const Boom = require('@hapi/boom');
const moment = require('moment');
const jsonResponse = require('../libs/utils').jsonResponse;

const listEvents = require('../services/event').listEvents;
const addEvent = require('../services/event').addEvent;
const addSlots = require('../services/event').addSlots;
const listAvalilability = require('../services/event').listAvalilability;
const checkEventsBetweenInterval = require('../services/event')
  .checkEventsBetweenInterval;

const CreateEventSchema = require('./schemas').CreateEventSchema;
const AddAvailabilitySchema = require('./schemas').AddAvailabilitySchema;

const handleListEvents = async (req, res, next) => {
  try {
    const list = await listEvents(req.query);
    res.send(jsonResponse(list));
  } catch (error) {
    console.log(error.stack);
    next(Boom.badImplementation());
  }
};

const listAvailability = async (req, res, next) => {
  try {
    const list = await listAvalilability();
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

    const result = await addEvent(req.body);
    if (result instanceof Error) {
      return next(Boom.badData(result.message));
    }
    res.send(jsonResponse(result));
  } catch (error) {
    console.log(error.stack);
    next(Boom.badImplementation());
  }
};

const addAvailability = async (req, res, next) => {
  try {
    const { error } = AddAvailabilitySchema.validate(req.body);
    if (error) {
      return next(Boom.badRequest(error.message));
    }

    let { start, end, duration } = req.body;

    start = moment(start);
    end = moment(end);

    if (!start.isAfter(moment())) {
      return next(Boom.badRequest('Invalid start time'));
    }
    if (!start.isBefore(end)) {
      return next(Boom.badRequest('Invalid start / end times'));
    }

    const eventsAdded = await checkEventsBetweenInterval(
      start.toDate(),
      end.toDate()
    );

    if (eventsAdded) {
      return next(Boom.badRequest('Events are already addded in this range'));
    }

    console.log(`[addAvailability] start    : ${start}`);
    console.log(`[addAvailability] end      : ${end}`);
    console.log(`[addAvailability] duration : ${duration}mins`);

    let slots = [],
      _slot = moment(start);

    while (_slot.isBefore(end)) {
      slots.push({ time: _slot.toDate(), duration, available: true });
      _slot.add(duration, 'minutes');
    }
    const result = await addSlots(slots);
    res.send(jsonResponse());
  } catch (error) {
    console.log(error.stack);
    next(Boom.badImplementation());
  }
};

module.exports = {
  handleListEvents,
  listEvents,
  postEvent,
  listAvailability,
  addAvailability
}