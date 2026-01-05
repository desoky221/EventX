import express from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByCategory,
  getRandomEvents
} from '../controllers/eventController.js';

const router = express.Router();

// Route to get all events
router.get('/', getAllEvents);

// Route to get events by category
router.get('/category/:category', getEventsByCategory);

// Route to get 2 random events (must be before /:id route)
router.get('/random', getRandomEvents);

// Route to get a single event by ID
router.get('/:id', getEventById);

// Route to create a new event
router.post('/', createEvent);

// Route to update an event
router.put('/:id', updateEvent);

// Route to delete an event
router.delete('/:id', deleteEvent);

export default router;

