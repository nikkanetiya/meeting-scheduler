const express = require('express');
const router = express.Router();

const { postEvent, listAvailability, getEvents } = require('../api/events');

router.get('/', getEvents);
router.post('/', postEvent);
router.get('/availability', listAvailability);

module.exports = router;
