import Enrollment from '../database/enrollment/enrollmentModel.js';
import Event from '../database/events/eventModel.js';
import User from '../database/user/userModel.js';

// Enroll in an event
export const enrollInEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.userId;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      event: eventId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this event'
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      user: userId,
      event: eventId
    });

    // Add to user's enrolledEvents array
    await User.findByIdAndUpdate(userId, {
      $addToSet: { enrolledEvents: eventId }
    });

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in event',
      data: enrollment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error enrolling in event',
      error: error.message
    });
  }
};

// Get user's enrollments
export const getUserEnrollments = async (req, res) => {
  try {
    const userId = req.userId;

    const enrollments = await Enrollment.find({ user: userId })
      .populate('event')
      .sort({ enrolledAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching enrollments',
      error: error.message
    });
  }
};

// Unenroll from an event
export const unenrollFromEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.userId;

    const enrollment = await Enrollment.findOneAndDelete({
      user: userId,
      event: eventId
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Remove from user's enrolledEvents array
    await User.findByIdAndUpdate(userId, {
      $pull: { enrolledEvents: eventId }
    });

    res.status(200).json({
      success: true,
      message: 'Successfully unenrolled from event'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error unenrolling from event',
      error: error.message
    });
  }
};

