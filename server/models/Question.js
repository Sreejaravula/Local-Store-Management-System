import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  tags: [{
    type: String,
  }],
  testCases: [{
    input: String,
    output: String,
    isHidden: {
      type: Boolean,
      default: false
    }
  }],
  solutionCode: {
    type: String,
    required: true,
  },
  maxRuntime: {
    type: Number, // in milliseconds
    required: true,
  },
  maxMemory: {
    type: Number, // in MB
    required: true,
  }
}, { timestamps: true });

export default mongoose.model('Question', questionSchema);