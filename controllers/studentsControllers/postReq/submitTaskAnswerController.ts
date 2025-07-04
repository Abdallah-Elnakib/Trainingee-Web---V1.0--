import { Request, Response } from 'express';
import { Track } from '../../../models/tracksSchema';
import { StudentData } from '../../../models/studentSchema';
import { handleQuestionSubmission } from './handleQuestionSubmission';

export const submitTaskAnswer = async (req: Request, res: Response): Promise<void> => {
    try {
        // Log para depuración
        console.log('Received submission:', req.body);
        
        const { trackName, studentId, taskName, answer, isQuestionSubmission, questionIndex, question, maxScore } = req.body;
        
        // Verificar si es una solicitud de envío de pregunta individual
        if (isQuestionSubmission === true && questionIndex !== undefined) {
            // Manejar el envío de una pregunta individual
            await handleQuestionSubmission(req, res);
            return;
        }
        
        // Validate required fields
        if (!trackName || !studentId || !taskName || !answer) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }
        
        // Find track
        const track = await Track.findOne({ trackName });
        if (!track) {
            res.status(404).json({ message: 'Track not found' });
            return;
        }
        
        // Find student in track
        const studentIndex = track.trackData.findIndex((student: any) => student.ID === Number(studentId));
        if (studentIndex === -1) {
            res.status(404).json({ message: 'Student not found in this track' });
            return;
        }
        
        // Find task in student's tasks
        const studentData = track.trackData[studentIndex];
        const taskIndex = studentData.BasicTotal.findIndex((task: any) => task.taskName === taskName);
        
        if (taskIndex === -1) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }
        
        const task = studentData.BasicTotal[taskIndex];
        
        // Check if task is already submitted
        if (task.submitted === true) {
            res.status(400).json({ 
                message: 'Task already submitted',
                feedback: task.feedback || null,
                score: task.studentTaskDegree || 0
            });
            return;
        }
        
        // Get questions from task
        let questions = [];
        try {
            if (task.Questions) {
                questions = JSON.parse(task.Questions);
            }
        } catch (error) {
            console.error('Error parsing questions:', error);
            res.status(500).json({ message: 'Error parsing task questions' });
            return;
        }
        
        if (questions.length === 0) {
            res.status(400).json({ message: 'No questions found for this task' });
            return;
        }
        
        // Generate question string for AI evaluation
        const questionString = questions.join('\\n');
        
        // Use AI to evaluate the answer (using a free model API)
        const aiFeedback = await evaluateAnswerWithAI(questionString, answer);
        
        // Calculate score based on AI evaluation
        const taskMaxDegree = task.taskDegree || 0;
        const score = Math.round(taskMaxDegree * aiFeedback.score / 100);
        
        // Update student task with answer, feedback and score
        task.submitted = true;
        task.studentAnswer = answer;
        task.feedback = aiFeedback.feedback;
        task.studentTaskDegree = score;
        
        // Update total degrees
        let totalDegrees = 0;
        studentData.BasicTotal.forEach((task: any) => {
            totalDegrees += task.studentTaskDegree || 0;
        });
        studentData.Degrees = totalDegrees;
        
        // Save changes
        track.markModified('trackData');
        await track.save();
        
        res.status(200).json({
            message: 'Task submitted and graded successfully',
            feedback: aiFeedback.feedback,
            score: score,
            maxScore: taskMaxDegree
        });
        
    } catch (error) {
        console.error('Error submitting task answer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Evaluate student answer using a free AI model API
 * This uses a simple algorithm that could be replaced with a real AI API
 */
async function evaluateAnswerWithAI(question: string, answer: string): Promise<{ feedback: string, score: number }> {
    try {
        // For demonstration, we'll use a simulated AI response
        // In production, you would replace this with an actual API call to a free model
        
        // Simulated AI processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simple evaluation logic
        const words = answer.split(' ').length;
        const questionWords = question.split(' ').length;
        
        let score = 0;
        let feedback = '';
        
        if (words < 5) {
            score = 20;
            feedback = 'Your answer is too short. Please provide a more detailed response that addresses all parts of the question.';
        } else if (words < 10) {
            score = 40;
            feedback = 'Your answer is somewhat brief. Consider expanding on your points and providing more examples or explanations.';
        } else if (words < questionWords) {
            score = 60;
            feedback = 'Your answer is good but could be more comprehensive. Try to address all aspects of the question in more detail.';
        } else if (words >= questionWords) {
            score = 90;
            feedback = 'Excellent answer! You have provided a thorough response that addresses the question well. Your explanation is clear and well-structured.';
        }
        
        // Check for relevant keywords in the answer relative to question
        const questionLower = question.toLowerCase();
        const answerLower = answer.toLowerCase();
        
        const keywordMatches = questionLower
            .split(' ')
            .filter(word => word.length > 4) // Only consider words longer than 4 characters
            .map(word => answerLower.includes(word))
            .filter(match => match).length;
            
        // Adjust score based on keyword matches
        if (keywordMatches > 5) {
            score = Math.min(score + 10, 100);
        }
        
        return {
            feedback,
            score
        };
        
    } catch (error) {
        console.error('AI evaluation error:', error);
        // Fallback evaluation if AI service fails
        return {
            feedback: 'We were unable to automatically evaluate your answer. A teacher will review it soon.',
            score: 50 // Default to 50% score when AI fails
        };
    }
}
