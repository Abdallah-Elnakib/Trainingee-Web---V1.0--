"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitQuestionAnswer = void 0;
const studentSchema_1 = require("../../../models/studentSchema");
const tracksSchema_1 = require("../../../models/tracksSchema");
/**
 * Controller for submitting and evaluating an individual question answer
 */
const submitQuestionAnswer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId, trackName, taskName, questionIndex, answer, question, maxScore } = req.body;
        // Validate required fields
        if (!studentId || !trackName || !taskName || questionIndex === undefined || !answer) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        // Find the student
        const student = yield studentSchema_1.StudentData.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        // Find the track
        const track = yield tracksSchema_1.Track.findOne({ trackName });
        if (!track) {
            return res.status(404).json({ message: 'Track not found' });
        }
        // Get task from track data
        const trackTasks = track.trackData || [];
        const task = trackTasks.find((t) => t.taskName === taskName);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        // Check if student is enrolled in this track
        const studentTrack = student.tracks.find((t) => t.trackName === track.trackName);
        if (!studentTrack) {
            return res.status(400).json({ message: 'Student is not enrolled in this track' });
        }
        // Find the task in student's track
        const studentTask = studentTrack.tasks.find((t) => t.taskName === task.taskName);
        if (!studentTask) {
            return res.status(400).json({ message: 'Task not found in student records' });
        }
        // Check if the deadline has passed
        if (task.deadLine) {
            const deadline = new Date(task.deadLine);
            const now = new Date();
            if (now > deadline) {
                return res.status(400).json({ message: 'Task deadline has passed' });
            }
        }
        // Initialize answers array if it doesn't exist
        if (!studentTask.answers) {
            studentTask.answers = [];
        }
        // Check if this specific question has already been submitted
        if (studentTask.answers[questionIndex] && studentTask.answers[questionIndex].submitted) {
            return res.status(400).json({
                message: 'Question already submitted',
                score: studentTask.answers[questionIndex].score,
                feedback: studentTask.answers[questionIndex].feedback
            });
        }
        // Evaluate the answer using AI
        const { score, feedback } = evaluateAnswerWithAI(answer, question, maxScore);
        // Save the answer and evaluation
        if (!Array.isArray(studentTask.answers)) {
            studentTask.answers = [];
        }
        // Store the result for this question
        studentTask.answers[questionIndex] = {
            answer,
            score,
            feedback,
            submitted: true,
            submittedAt: new Date()
        };
        // Calculate total score for the task (sum of all question scores)
        let totalScore = 0;
        studentTask.answers.forEach((ans) => {
            if (ans && ans.submitted) {
                totalScore += ans.score || 0;
            }
        });
        // Update student task degree
        studentTask.studentTaskDegree = totalScore;
        // Save changes to database
        yield student.save();
        // Return success with score and feedback
        return res.status(200).json({
            message: 'Answer submitted successfully',
            score,
            feedback,
            maxScore
        });
    }
    catch (error) {
        console.error('Error submitting question answer:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.submitQuestionAnswer = submitQuestionAnswer;
/**
 * Evaluates an answer using AI techniques
 * @param answer The student's answer
 * @param question The question that was asked
 * @param maxScore The maximum score possible for this question
 * @returns Score and feedback
 */
function evaluateAnswerWithAI(answer, question, maxScore) {
    // This is a simplified evaluation function that assesses the answer based on:
    // 1. Length of the answer relative to expected length
    // 2. Presence of keywords from the question
    // 3. Overall structure and completeness
    // Extract question text
    const questionText = typeof question === 'string' ? question : question.text || '';
    // Simple analysis of the answer
    const answerWords = answer.split(/\s+/).filter((w) => w.length > 0).length;
    const questionWords = Math.max(10, questionText.split(/\s+/).filter((w) => w.length > 0).length * 2);
    // Initialize score and feedback
    let score = 0;
    let feedback = '';
    // Evaluate based on length (simple initial metric)
    if (answerWords < questionWords * 0.3) {
        score = Math.floor(maxScore * 0.3);
        feedback = 'Your answer is too brief. Consider providing a more detailed explanation that fully addresses the question.';
    }
    else if (answerWords < questionWords * 0.7) {
        score = Math.floor(maxScore * 0.5);
        feedback = 'Your answer is good but could be more comprehensive. Try to address all aspects of the question in more detail.';
    }
    else if (answerWords >= questionWords) {
        score = Math.floor(maxScore * 0.9);
        feedback = 'Excellent answer! You have provided a thorough response that addresses the question well. Your explanation is clear and well-structured.';
    }
    // Check for relevant keywords in the answer relative to question
    const questionKeywords = extractKeywords(questionText);
    const answerKeywords = extractKeywords(answer);
    const keywordMatches = questionKeywords.filter(kw => answerKeywords.includes(kw));
    const keywordScore = keywordMatches.length / Math.max(1, questionKeywords.length);
    // Adjust score based on keyword relevance
    if (keywordScore < 0.3) {
        score = Math.max(Math.floor(maxScore * 0.2), Math.floor(score * 0.7));
        feedback += ' However, your answer seems to miss some key concepts from the question.';
    }
    else if (keywordScore > 0.7) {
        score = Math.min(maxScore, Math.floor(score * 1.2));
        feedback += ' Your answer includes many relevant concepts and terms from the question.';
    }
    // Ensure score doesn't exceed maximum
    score = Math.min(score, maxScore);
    return { score, feedback };
}
/**
 * Extract important keywords from text
 */
function extractKeywords(text) {
    // Simple keyword extraction - remove common words and return unique meaningful words
    const commonWords = new Set([
        'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with',
        'by', 'about', 'as', 'of', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
        'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall',
        'should', 'can', 'could', 'may', 'might', 'must', 'this', 'that', 'these',
        'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'their', 'my', 'your',
        'his', 'her', 'its', 'our', 'their'
    ]);
    return text.toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .split(/\s+/)
        .filter((word) => word.length > 3 && !commonWords.has(word)) // Filter out common words and short words
        .filter((word, index, self) => self.indexOf(word) === index); // Unique words only
}
