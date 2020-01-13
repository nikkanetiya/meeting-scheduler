const express = require('express');
const router = express.Router();
const eventRoutes = require('./events');

router.use('/events', eventRoutes);

module.exports = router;
