const express = require('express');
const router = express.Router();

const handleListEvents = require('../api/events').handleListEvents;
const postEvent = require('../api/events').postEvent;
const addAvailability = require('../api/events').addAvailability;
const listAvailability = require('../api/events').listAvailability;

router.get('/', handleListEvents);
router.post('/', postEvent);
router.post('/availability', addAvailability);
router.get('/availability', listAvailability);

module.exports = router;
