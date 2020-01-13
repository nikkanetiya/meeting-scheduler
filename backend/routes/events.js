const express = require('express');
const router = express.Router();

const {
  postEvent,
  addAvailability,
  listAvailability,
  handleListEvents
} = require('../api/events');

router.get('/', handleListEvents);
router.post('/', postEvent);
router.post('/availability', addAvailability);
router.get('/availability', listAvailability);

module.exports = router;
