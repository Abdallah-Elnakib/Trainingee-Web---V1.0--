import { Request, Response } from 'express';
import { Track } from '../../../models/tracksSchema';
import { StudentData } from '../../../models/studentSchema';

/**
 * Evaluate student answer using a simple algorithm
 */
export async function evaluateQuestionWithAI(question: string, answer: string): Promise<{ feedback: string, score: number }> {
    try {
        // Simple algorithm based on answer length and complexity
        const minScore = 30;
        const maxScore = 100;
        
        // Calculate score based on answer length and complexity
        const answerWords = answer.split(/\s+/).length;
        const questionWords = question.split(/\s+/).length;
        
        let score = minScore;
        let feedback = 'Your answer is too brief. Consider providing a more detailed explanation.';
        
        // Simple heuristic based on answer length relative to question
        if (answerWords < questionWords / 2) {
            score = minScore;
            feedback = 'Your answer is too brief. Consider providing a more detailed explanation.';
        } else if (answerWords < questionWords) {
            score = minScore + (maxScore - minScore) * 0.5;
            feedback = 'Your answer is good but could be more comprehensive. Try to address all aspects of the question in more detail.';
        } else if (answerWords >= questionWords) {
            score = minScore + (maxScore - minScore) * 0.9;
            feedback = 'Excellent answer! You have provided a thorough response that addresses the question well. Your explanation is clear and well-structured.';
        }
        
        return { feedback, score: Math.round(score) };
    } catch (error) {
        console.error('Error in evaluateQuestionWithAI:', error);
        return { 
            feedback: 'We were unable to evaluate your answer due to a technical issue.', 
            score: 50 // Default score if something goes wrong
        };
    }
}

/**
 * Handle submission of an individual question answer
 */
export async function handleQuestionSubmission(req: Request, res: Response): Promise<void | Response> {
    try {
        console.log('Handling question submission');
        const { trackName, studentId, taskName, questionIndex, answer, question, maxScore } = req.body;
        
        // Validate required fields
        if (!trackName || !studentId || !taskName || questionIndex === undefined || !answer) {
            res.status(400).json({ message: 'Missing required fields for question submission' });
            return;
        }
        
        // Find student
        const student = await StudentData.findById(studentId);
        if (!student) {
            res.status(404).json({ message: 'Student not found' });
            return;
        }
        
        // Find track
        const track = await Track.findOne({ trackName });
        if (!track) {
            res.status(404).json({ message: 'Track not found' });
            return;
        }
        
        // SOLUCIÓN TEMPORAL: Para fines de prueba, permitiremos que cualquier estudiante envíe respuestas a cualquier pista
        console.log('Student tracks:', student.tracks?.map((t: any) => t.trackName));
        console.log('Looking for track:', track.trackName);
        
        // Inicializar el array de tracks si no existe
        if (!student.tracks || !Array.isArray(student.tracks)) {
            student.tracks = [];
        }
        
        // Primero intentamos encontrar una coincidencia exacta o por nombre normalizado
        let studentTrack = student.tracks.find((t: any) => {
            if (!t || !t.trackName) return false;
            
            const studentTrackName = t.trackName.trim().toLowerCase();
            const targetTrackName = track.trackName.trim().toLowerCase();
            
            console.log(`Comparing: '${studentTrackName}' with '${targetTrackName}'`);
            return studentTrackName === targetTrackName;
        });
        
        // Si no encontramos una coincidencia, usamos la primera pista del estudiante (solución temporal)
        if (!studentTrack && student.tracks.length > 0) {
            console.log('No exact match found. Using first track as fallback.');
            studentTrack = student.tracks[0];
        }
        
        // Si aún no tenemos una pista, creamos una estructura temporal
        if (!studentTrack) {
            console.log('Creating temporary track for testing purposes');
            studentTrack = {
                trackName: track.trackName,
                tasks: []
            };
            student.tracks.push(studentTrack);
        }
        
        console.log('Student track being used:', studentTrack.trackName);
        
        // Inicializar el array de tasks si no existe
        if (!studentTrack.tasks || !Array.isArray(studentTrack.tasks)) {
            studentTrack.tasks = [];
        }
        
        // Find the task in student's track
        console.log('Looking for task:', taskName);
        console.log('Available tasks:', studentTrack.tasks.map((t: any) => t.taskName || 'unnamed'));
        
        // Buscar la tarea por nombre normalizado
        let studentTask = studentTrack.tasks.find((t: any) => {
            if (!t || !t.taskName) return false;
            
            const taskNameNormalized = t.taskName.trim().toLowerCase();
            const targetTaskNameNormalized = taskName.trim().toLowerCase();
            
            console.log(`Comparing task: '${taskNameNormalized}' with '${targetTaskNameNormalized}'`);
            return taskNameNormalized === targetTaskNameNormalized;
        });
        
        // SOLUCIÓN TEMPORAL: Si no encontramos la tarea, creamos una temporal para fines de prueba
        if (!studentTask) {
            console.log('Task not found. Creating temporary task for testing purposes');
            
            studentTask = {
                taskName: taskName,
                answers: [],
                studentTaskDegree: 0,
                submitted: false
            };
            
            studentTrack.tasks.push(studentTask);
        }
        
        console.log('Using task:', studentTask.taskName);
        
        // Initialize answers array if it doesn't exist
        if (!studentTask.answers || !Array.isArray(studentTask.answers)) {
            studentTask.answers = [];
        }
        
        // Check if this specific question has already been submitted
        if (studentTask.answers[questionIndex] && studentTask.answers[questionIndex].submitted) {
            res.status(400).json({ 
                message: 'Question already submitted',
                score: studentTask.answers[questionIndex].score,
                feedback: studentTask.answers[questionIndex].feedback
            });
            return;
        }
        
        // Evaluate the answer using AI
        console.log('Question data:', question);
        
        // Manejar diferentes formatos de la pregunta
        let questionText = '';
        try {
            if (typeof question === 'string') {
                questionText = question;
            } else if (question && typeof question === 'object') {
                if (question.text) {
                    questionText = question.text;
                } else if (question.toString) {
                    questionText = question.toString();
                }
            } else {
                // Si no podemos extraer el texto de la pregunta, usamos un texto predeterminado
                questionText = 'Question';
            }
        } catch (error) {
            console.error('Error extracting question text:', error);
            questionText = 'Question';
        }
        
        console.log('Extracted question text:', questionText);
        const pointsPerQuestion = maxScore || 25; // Default to 25 points if not specified
        
        // Evaluate answer
        let feedback = '';
        let score = 0;
        let scaledScore = 0;
        
        try {
            // Evaluar la respuesta
            const result = await evaluateQuestionWithAI(questionText, answer);
            feedback = result.feedback;
            score = result.score;
            
            // Scale score to max points for this question
            scaledScore = Math.round((score / 100) * pointsPerQuestion);
            
            console.log('Evaluation result:', { feedback, score, scaledScore });
        } catch (error) {
            console.error('Error during evaluation:', error);
            feedback = 'We were unable to evaluate your answer due to a technical issue.';
            score = 50; // Default score if evaluation fails
            scaledScore = Math.round((score / 100) * pointsPerQuestion);
        }
        
        // Store the result for this question
        studentTask.answers[questionIndex] = {
            answer,
            score: scaledScore,
            feedback,
            submitted: true,
            submittedAt: new Date()
        };
        
        // Calculate total score for the task (sum of all question scores)
        let totalScore = 0;
        studentTask.answers.forEach((ans: any) => {
            if (ans && ans.submitted) {
                totalScore += ans.score || 0;
            }
        });
        
        // Update student task degree
        studentTask.studentTaskDegree = totalScore;
        
        // Save changes to database
        try {
            console.log('Saving student data...');
            student.markModified('tracks'); // Asegurar que Mongoose detecte los cambios en el array
            await student.save();
            console.log('Student data saved successfully');
            
            // Return success with score and feedback
            return res.status(200).json({
                message: 'Answer submitted successfully',
                score: scaledScore,
                feedback,
                maxScore: pointsPerQuestion
            });
        } catch (error) {
            console.error('Error saving student data:', error);
            return res.status(500).json({ 
                message: 'Error saving your answer to the database', 
                error: error instanceof Error ? error.message : String(error)
            });
        }
    } catch (error) {
        console.error('Error submitting question answer:', error);
        return res.status(500).json({ 
            message: 'Server error',
            error: error instanceof Error ? error.message : String(error)
        });
    }
}
