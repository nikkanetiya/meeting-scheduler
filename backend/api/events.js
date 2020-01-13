import Boom from '@hapi/boom';
import moment from 'moment';
import { jsonResponse } from '../libs/utils';
import {
  listEvents,
  addEvent,
  addSlots,
  listAvalilability,
  checkEventsBetweenInterval
} from '../services/event';

export const handleListEvents = async (req, res, next) => {
  try {
    const list = await listEvents(req.query);
    res.send(jsonResponse(list));
  } catch (error) {
    console.log(error.stack);
    next(Boom.badImplementation());
  }
};

export const listAvailability = async (req, res, next) => {
  try {
    const list = await listAvalilability();
    res.send(jsonResponse(list));
  } catch (error) {
    console.log(error.stack);
    next(Boom.badImplementation());
  }
};

export const postEvent = async (req, res, next) => {
  try {
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

export const addAvailability = async (req, res, next) => {
  try {
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
    console.log(`[addAvailability] eventsAdded    : ${eventsAdded}`);

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
    res.send(jsonResponse(result));
  } catch (error) {
    console.log(error.stack);
    next(Boom.badImplementation());
  }
};
