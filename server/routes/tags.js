import express from 'express';
import Tag from '../models/Tag.js';

const router = express.Router();

// Get all tags
router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.query.pinned) {
      query.pinned = req.query.pinned;
    }
    const tags = await Tag.find(query);
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new tag
router.post('/', async (req, res) => {
  const tag = new Tag(req.body);
  try {
    const newTag = await tag.save();
    res.status(201).json(newTag);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete tag
router.delete('/:id', async (req, res) => {
  try {
    await Tag.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tag deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update tag
router.patch('/:id', async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    Object.assign(tag, req.body);
    const updatedTag = await tag.save();
    res.json(updatedTag);
  }
  catch (error) {
    res.status(400).json({ message: error.message });
  }
})

export default router;