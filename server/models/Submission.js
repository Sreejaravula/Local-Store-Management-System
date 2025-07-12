import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error'],
    required: true,
  },
  runtime: Number,
  memory: Number,
  testCaseResults: [{
    input: String,
    expectedOutput: String,
    actualOutput: String,
    passed: Boolean,
  }]
}, { timestamps: true });

export default mongoose.model('Submission', submissionSchema);