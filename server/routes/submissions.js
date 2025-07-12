import express from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import Question from '../models/Question.js';
import Submission from '../models/Submission.js';
import { VM } from 'vm2';

const router = express.Router();

const runCode = async (code, input, timeLimit) => {
  const vm = new VM({
    timeout: timeLimit,
    sandbox: {
      console: {
        log: (...args) => args.join(' '),
      },
      input,
    },
  });

  try {
    const result = await vm.run(`
      ${code}
      // Assuming the last expression is the result
      console.log(result);
    `);
    return { output: result, error: null };
  } catch (error) {
    return { output: null, error: error.message };
  }
};

// Run code with custom input
router.post('/run', isAuthenticated, async (req, res) => {
  try {
    const { code, input, questionId } = req.body;
    const question = await Question.findById(questionId);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const { output, error } = await runCode(code, input, question.maxRuntime);
    
    if (error) {
      return res.status(400).json({ error });
    }

    res.json({ output });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit solution
router.post('/submit', isAuthenticated, async (req, res) => {
  try {
    const { code, questionId } = req.body;
    const question = await Question.findById(questionId);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const testResults = [];
    let allPassed = true;
    let maxRuntime = 0;
    let maxMemory = 0;

    // Run all test cases
    for (const testCase of question.testCases) {
      const start = process.hrtime();
      const { output, error } = await runCode(code, testCase.input, question.maxRuntime);
      const [seconds, nanoseconds] = process.hrtime(start);
      const runtime = seconds * 1000 + nanoseconds / 1000000;

      maxRuntime = Math.max(maxRuntime, runtime);
      
      // Simple memory calculation (not accurate in production)
      const memory = process.memoryUsage().heapUsed / 1024 / 1024;
      maxMemory = Math.max(maxMemory, memory);

      const passed = !error && output?.trim() === testCase.output.trim();
      allPassed = allPassed && passed;

      testResults.push({
        input: testCase.isHidden ? '[Hidden]' : testCase.input,
        expectedOutput: testCase.isHidden ? '[Hidden]' : testCase.output,
        actualOutput: testCase.isHidden ? '[Hidden]' : output,
        passed,
      });

      // Check limits
      if (runtime > question.maxRuntime) {
        return res.json({
          status: 'time_limit_exceeded',
          runtime,
          memory: maxMemory,
          testCaseResults: testResults,
        });
      }

      if (maxMemory > question.maxMemory) {
        return res.json({
          status: 'memory_limit_exceeded',
          runtime,
          memory: maxMemory,
          testCaseResults: testResults,
        });
      }
    }

    // Create submission record
    const submission = new Submission({
      userId: req.user._id,
      questionId,
      code,
      language: 'javascript',
      status: allPassed ? 'accepted' : 'wrong_answer',
      runtime: maxRuntime,
      memory: maxMemory,
      testCaseResults,
    });

    await submission.save();

    // Update user's solved/attempted questions
    if (allPassed) {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { solvedQuestions: questionId }
      });
    } else {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { attemptedQuestions: questionId }
      });
    }

    res.json({
      status: allPassed ? 'accepted' : 'wrong_answer',
      runtime: maxRuntime,
      memory: maxMemory,
      testCaseResults,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;