import express from 'express';
const router = express.Router();
import {
  handleListEvents,
  postEvent,
  addAvailability,
  listAvailability
} from '../api/events';

router.get('/', handleListEvents);
router.post('/', postEvent);
router.post('/availability', addAvailability);
router.get('/availability', listAvailability);

export default router;
