import express from 'express';
import Question from '../models/Question.js';
import { isAdmin, isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Get all questions (public)
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find().select('-solutionCode -testCases.isHidden');
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single question (public)
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).select('-solutionCode -testCases.isHidden');
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes
// Get all questions (admin)
router.get('/admin', isAdmin, async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create question (admin)
router.post('/', isAdmin, async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update question (admin)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete question (admin)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;