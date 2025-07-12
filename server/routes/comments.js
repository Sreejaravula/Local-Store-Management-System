import express from 'express';
import Comment from '../models/Comment.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Get comments for a question
router.get('/:questionId', async (req, res) => {
  try {
    const comments = await Comment.find({ 
      questionId: req.params.questionId,
      parentId: null 
    })
    .populate('userId', 'username')
    .populate({
      path: 'replies',
      populate: {
        path: 'userId',
        select: 'username'
      }
    })
    .sort('-createdAt');

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { questionId, content, parentId } = req.body;
    
    // Extract mentions from content
    const mentions = content.match(/@(\w+)/g) || [];
    const mentionedUsers = await User.find({
      username: { $in: mentions.map(m => m.substring(1)) }
    });

    const comment = new Comment({
      questionId,
      userId: req.user._id,
      content,
      parentId,
      mentions: mentionedUsers.map(u => u._id),
      level: parentId ? (await Comment.findById(parentId))?.level + 1 : 0
    });

    await comment.save();

    // Populate user info
    await comment.populate('userId', 'username');

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update comment
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }

    comment.content = req.body.content;
    
    // Update mentions
    const mentions = req.body.content.match(/@(\w+)/g) || [];
    const mentionedUsers = await User.find({
      username: { $in: mentions.map(m => m.substring(1)) }
    });
    comment.mentions = mentionedUsers.map(u => u._id);

    await comment.save();
    await comment.populate('userId', 'username');

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }

    // Also delete all replies
    await Comment.deleteMany({ parentId: comment._id });
    await comment.remove();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;