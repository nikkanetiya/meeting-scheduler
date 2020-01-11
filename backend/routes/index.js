import express from 'express';
const router = express.Router();
import eventRoutes from './events';

router.use('/events', eventRoutes);

export default router;
