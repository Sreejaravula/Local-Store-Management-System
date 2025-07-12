import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  color: {
    type: String,
    default: '#000000'
  },
  pinned: {
    type: Boolean,
    default: true
  }
});

export default mongoose.model('Tag', tagSchema);