import express from 'express';
import {
  enrollInEvent,
  getUserEnrollments,
  unenrollFromEvent
} from '../controllers/enrollmentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/events/:eventId', enrollInEvent);
router.get('/my-enrollments', getUserEnrollments);
router.delete('/events/:eventId', unenrollFromEvent);

export default router;

