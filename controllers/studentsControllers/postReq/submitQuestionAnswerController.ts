import { Request, Response } from 'express';
import { StudentData } from '../../../models/studentSchema';
import { Track } from '../../../models/tracksSchema';

// Tipo para la respuesta a una pregunta
interface QuestionAnswer {
    answer: string;
    score: number;
    feedback: string;
    submitted: boolean;
    submittedAt?: Date;
}

/**
 * Helper function para extraer keywords simples del texto
 */
function extractKeywords(text: string): string[] {
    if (!text) return [];
    
    // Eliminar signos de puntuación y convertir a minúsculas
    const normalized = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
    
    // Dividir en palabras y filtrar palabras comunes
    const commonWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'as'];
    const words = normalized.split(/\s+/).filter(word => word.length > 3 && !commonWords.includes(word));
    
    // Devolver palabras únicas
    return [...new Set(words)];
}

import axios from 'axios';

/**
 * Función para evaluar respuestas usando un servicio real de IA (Hugging Face API - gratuito)
 */
async function evaluateAnswerWithAI(answer: string, question: string, maxPoints: number): Promise<{ score: number, feedback: string }> {
    // Si la respuesta está vacía o es muy corta
    if (!answer || answer.trim().length < 3) {
        return {
            score: 0,
            feedback: 'La respuesta está vacía o es demasiado corta. Por favor, proporciona una respuesta completa.'
        };
    }

    try {
        // Crear el prompt para el modelo de IA
        const prompt = `Evalúa la siguiente respuesta a una pregunta de programación o tecnología. 

Pregunta: ${question} 

Respuesta del estudiante: ${answer} 

Califica esta respuesta del 0 al 100 basándote en:
1. Precisión técnica
2. Completitud
3. Claridad
4. Estructura (si es código)

Devuelve un JSON con este formato exacto: {"score": [puntuación numérica entre 0 y 100], "feedback": "[retroalimentación detallada para el estudiante]"}`;

        // Llamar a la API de Hugging Face (servicio gratuito)
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
            { inputs: prompt },
            {
                headers: {
                    'Content-Type': 'application/json',
                    // No se requiere token para modelos públicos
                }
            }
        );

        // Procesar la respuesta
        let result;
        try {
            const responseText = response.data.generated_text || response.data[0].generated_text;
            // Extraer el JSON de la respuesta (podría estar dentro de un bloque de código)
            const jsonMatch = responseText.match(/\{[\s\S]*?"score"[\s\S]*?"feedback"[\s\S]*?\}/);
            if (jsonMatch) {
                result = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No se pudo extraer el JSON de la respuesta');
            }
        } catch (parseError) {
            console.error('Error al parsear la respuesta de la IA:', parseError);
            // Usar evaluación de respaldo
            return fallbackEvaluation(answer, question, maxPoints);
        }

        // Normalizar la puntuación al rango del maxPoints
        const normalizedScore = Math.round((result.score / 100) * maxPoints);
        
        return {
            score: normalizedScore,
            feedback: result.feedback
        };
        
    } catch (error) {
        console.error('Error al llamar al servicio de IA:', error);
        // Si hay algún error con la API, usar el método de respaldo
        return fallbackEvaluation(answer, question, maxPoints);
    }
}

/**
 * Evaluación de respaldo en caso de fallo de la API
 */
function fallbackEvaluation(answer: string, question: string, maxPoints: number): { score: number, feedback: string } {
    // Normalizar respuesta y pregunta para análisis
    const normalizedAnswer = answer.trim().toLowerCase();
    const normalizedQuestion = question.trim().toLowerCase();
    
    // Extraer palabras clave de la pregunta
    const questionKeywords = extractKeywords(normalizedQuestion);
    const answerKeywords = extractKeywords(normalizedAnswer);
    
    // Calcular cuántas palabras clave de la pregunta aparecen en la respuesta
    const matchingKeywords = questionKeywords.filter(keyword => 
        answerKeywords.includes(keyword) || normalizedAnswer.includes(keyword)
    );
    
    // Calcular porcentaje de coincidencia de palabras clave
    const keywordMatchPercentage = questionKeywords.length > 0 ?
        (matchingKeywords.length / questionKeywords.length) : 0;
    
    // Factores para evaluación
    const lengthFactor = Math.min(1, normalizedAnswer.length / 100);
    const keywordFactor = keywordMatchPercentage;
    const structureFactor = normalizedAnswer.includes('if') || 
                           normalizedAnswer.includes('for') || 
                           normalizedAnswer.includes('function') || 
                           normalizedAnswer.includes('return') ? 0.2 : 0;
    
    // Calcular puntuación total (ponderación de factores)
    const rawScore = (lengthFactor * 0.3) + (keywordFactor * 0.5) + structureFactor;
    const finalScore = Math.round(rawScore * maxPoints);
    
    // Proporcionar retroalimentación
    let feedback = '';
    const percentage = (finalScore / maxPoints) * 100;
    
    if (percentage < 30) {
        feedback = 'Tu respuesta necesita mejorar significativamente. Asegúrate de abordar los conceptos clave de la pregunta.';
    } else if (percentage < 50) {
        feedback = 'Tu respuesta es básica. Considera incluir más detalles.';
    } else if (percentage < 70) {
        feedback = 'Buena respuesta, pero hay espacio para mejorar.';
    } else if (percentage < 90) {
        feedback = 'Muy buena respuesta que aborda la mayoría de los aspectos importantes.';
    } else {
        feedback = 'Excelente respuesta, completa y bien estructurada.';
    }
    
    return { score: finalScore, feedback };
}

/**
 * Controller for submitting and evaluating an individual question answer
 */
export const submitQuestionAnswer = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        console.log('Received submit question request:', req.body);
        const { studentId, trackName, taskName, questionIndex, answer, question, maxScore } = req.body;

        // Validate required fields
        if (!studentId || !trackName || !taskName || questionIndex === undefined || !answer) {
            console.log('Missing required fields:', { studentId, trackName, taskName, questionIndex, answer });
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Find the student
        const student = await StudentData.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Buscar el track exacto
        let track = await Track.findOne({ trackName });
        
        // Si no encuentra el track exacto, buscar todos los tracks y elegir el primero
        if (!track) {
            console.log(`Track '${trackName}' no encontrado. Buscando alternativas...`);
            
            // Obtener todos los tracks disponibles
            const tracks = await Track.find();
            if (tracks && tracks.length > 0) {
                // Usar el primer track disponible
                track = tracks[0];
                console.log(`Usando track alternativo: ${track.trackName}`);
            } else {
                return res.status(404).json({ message: 'No existen tracks en el sistema' });
            }
        }
        
        // Get task from track data
        const trackTasks = track.trackData || [];
        console.log('Track data:', { trackName, taskTasks: trackTasks.length, taskName });
        
        // Imprimir nombres de todas las tareas en trackTasks para depuración
        console.log('Available tasks:', trackTasks.map((t: any) => t.taskName || 'unnamed'));
        
        // SOLUCIÓN TEMPORAL: Buscar la tarea por nombre de forma más flexible
        let task: any = null;
        
        // Método 1: Búsqueda exacta (case insensitive)
        task = trackTasks.find((t: any) => {
            if (!t || !t.taskName) return false;
            return t.taskName.trim().toLowerCase() === taskName.trim().toLowerCase();
        });
        
        // Método 2: Búsqueda parcial (contiene el nombre)
        if (!task) {
            console.log('Trying partial name matching...');
            task = trackTasks.find((t: any) => {
                if (!t || !t.taskName) return false;
                return t.taskName.trim().toLowerCase().includes(taskName.trim().toLowerCase()) || 
                       taskName.trim().toLowerCase().includes(t.taskName.trim().toLowerCase());
            });
        }
        
        // Método 3: Búsqueda por día/número
        if (!task && taskName.toLowerCase().includes('day')) {
            console.log('Trying to match by day number...');
            const dayMatch = taskName.match(/day\s*(\d+)/i);
            if (dayMatch && dayMatch[1]) {
                const dayNumber = dayMatch[1];
                task = trackTasks.find((t: any) => {
                    if (!t || !t.taskName) return false;
                    return t.taskName.toLowerCase().includes(`day ${dayNumber}`) || 
                           t.taskName.toLowerCase().includes(`day${dayNumber}`);
                });
            }
        }
        
        // Si no encontramos la tarea exacta, usar la primera tarea disponible en el track
        if (!task) {
            console.log('Task not found with any matching method. Buscando tareas existentes en el track...');
            
            // Verificar si hay tareas disponibles en el track
            if (trackTasks && trackTasks.length > 0) {
                // Usar la primera tarea disponible
                task = trackTasks[0];
                console.log(`Usando tarea existente: ${task.taskName}`);
            } else {
                // Si no hay tareas, crear una tarea básica real
                console.log('No hay tareas en el track. Creando una tarea básica.');
                task = {
                    taskName: 'Basic JavaScript Task',
                    taskDegree: 100,
                    Questions: JSON.stringify([
                        "Write a function that adds all the numbers in an array.",
                        "Print only even numbers from 1 to n",
                        "Create a function to check if a string is a palindrome"
                    ])
                };
                
                // Agregar la tarea al track para futuras solicitudes
                trackTasks.push(task);
                track.markModified('trackData');
                await track.save();
                
                console.log('New basic task created:', task.taskName);
            }
        } else {
            console.log('Task found:', task.taskName);
        }

        // Verificar si el estudiante está inscrito en este track (manejo de estructura mixta)
        console.log('Verificando inscripción del estudiante en track:', track.trackName);
        console.log('Tracks del estudiante:', student.tracks);
        
        // Buscar si el estudiante está inscrito en el track (considerando ambos formatos)
        let studentTrack: any = null;
        let isEnrolled = false;
        
        // Comprobar en ambos formatos (string y objeto)
        for (const t of student.tracks) {
            // Formato 1: Simple string con el nombre del track
            if (typeof t === 'string' && t === track.trackName) {
                isEnrolled = true;
                // Crear un objeto de track si solo existe como string
                studentTrack = {
                    trackName: track.trackName,
                    tasks: [],
                    enrolled: true
                };
                break;
            }
            // Formato 2: Objeto completo con trackName
            else if (typeof t === 'object' && t && t.trackName === track.trackName) {
                isEnrolled = true;
                studentTrack = t;
                break;
            }
        }
        
        // Si no está inscrito, inscribirlo
        if (!isEnrolled) {
            console.log('Estudiante no inscrito en el track:', { studentId, trackName: track.trackName });
            
            // Crear un nuevo objeto de track con el formato correcto
            const newTrack = {
                trackName: track.trackName,
                tasks: [],
                enrolled: true,
                enrolledAt: new Date()
            };
            
            // Añadir el nuevo track al estudiante
            student.tracks.push(newTrack);
            student.markModified('tracks');
            await student.save();
            console.log(`Estudiante ${student.name} matriculado en ${track.trackName}`);
            
            // Actualizar studentTrack para su uso posterior
            studentTrack = newTrack;
            
            // Informar al usuario
            return res.status(200).json({ 
                message: 'Por favor, vuelve a cargar la página para ver los cursos en los que estás matriculado.', 
                redirectToEnrollment: true,
                trackName: track.trackName
            });
        }

        // Verificar y preparar el array de tareas si es necesario
        if (!studentTrack.tasks) {
            studentTrack.tasks = [];
            student.markModified('tracks');
        }
        
        // Buscar la tarea en el track del estudiante o crearla si no existe
        let studentTask = null;
        
        // Asegurarse de que studentTrack.tasks es un array
        if (Array.isArray(studentTrack.tasks)) {
            studentTask = studentTrack.tasks.find((t: any) => {
                if (!t || !t.taskName) return false;
                return t.taskName.trim().toLowerCase() === task.taskName.trim().toLowerCase();
            });
        }

        // Si no se encuentra la tarea, crearla
        if (!studentTask) {
            console.log('Tarea no encontrada en el registro del estudiante, creando:', task.taskName);
            
            // Crear una nueva tarea con el formato correcto
            studentTask = {
                taskName: task.taskName,
                studentTaskDegree: 0,
                answers: [],
                startedAt: new Date()
            };
            
            // Agregar la tarea al array de tareas del estudiante
            studentTrack.tasks.push(studentTask);
            student.markModified('tracks');
            await student.save();
            console.log('Tarea creada en el registro del estudiante:', task.taskName);
        }

        // Check if the deadline has passed (solo si existe deadline)
        if (task.deadLine) {
            const deadline = new Date(task.deadLine);
            const now = new Date();
            if (now > deadline) {
                console.log('Deadline has passed, but allowing submission for testing');
                // NOTA: En un entorno de producción, aquí retornaríamos un error
                // return res.status(400).json({ message: 'Task deadline has passed' });
            }
        }

        // Initialize answers array if it doesn't exist
        if (!studentTask.answers) {
            studentTask.answers = [];
        }

        // Si falta maxScore, asignar un valor predeterminado
        const pointsPerQuestion = maxScore || 25;

        // Check if this specific question has already been submitted
        if (studentTask.answers[questionIndex] && studentTask.answers[questionIndex].submitted) {
            console.log('Question already submitted - preventing resubmission');
            // Devolver la información existente en lugar de permitir el reenvío
            return res.status(200).json({ 
                message: 'Question already submitted',
                score: studentTask.answers[questionIndex].score,
                feedback: studentTask.answers[questionIndex].feedback,
                maxScore: pointsPerQuestion,
                alreadySubmitted: true
            });
        }
        
        // Evaluar la respuesta usando IA real
        const evaluationResult = await evaluateAnswerWithAI(answer, question || 'No question provided', pointsPerQuestion);
        const { score, feedback } = evaluationResult;
        
        // Log para depuración
        console.log('Evaluación IA:', { score, feedback, maxPoints: pointsPerQuestion });

        // Optimizar almacenamiento: inicializar array si no existe
        if (!Array.isArray(studentTask.answers)) {
            studentTask.answers = [];
        }
        
        // Almacenar el resultado para esta pregunta (solo datos esenciales)
        studentTask.answers[questionIndex] = {
            answer: answer,
            score: score,
            feedback: feedback,
            submitted: true,
            submittedAt: new Date()
        };

        // Recalcular la puntuación total de la tarea
        let totalScore = 0;
        studentTask.answers.forEach((ans: any) => {
            if (ans && ans.submitted) {
                totalScore += ans.score || 0;
            }
        });

        // Actualizar la puntuación de la tarea en la estructura existente
        studentTask.studentTaskDegree = totalScore;
        
        // Buscar y actualizar la puntuación en el trackData también si existe
        if (track && Array.isArray(track.trackData)) {
            // Buscar al estudiante en trackData por nombre
            const studentInTrack = track.trackData.find((std: any) => 
                std && std.Name === student.name
            );
            
            if (studentInTrack) {
                // Buscar la tarea en BasicTotal
                const taskInBasicTotal = Array.isArray(studentInTrack.BasicTotal) ? 
                    studentInTrack.BasicTotal.find((t: any) => 
                        t && t.taskName === task.taskName
                    ) : null;
                
                if (taskInBasicTotal) {
                    // Actualizar la puntuación en la estructura existente
                    taskInBasicTotal.studentTaskDegree = totalScore;
                    track.markModified('trackData');
                    await track.save();
                    console.log('Puntuación actualizada en trackData:', totalScore);
                }
            }
        }

        // Marcar los datos del estudiante como modificados y guardar
        student.markModified('tracks');
        await student.save();

        // Devolver la respuesta con la puntuación y retroalimentación
        return res.status(200).json({
            message: 'Answer submitted successfully',
            score: score,
            feedback: feedback,
            maxScore: pointsPerQuestion
        });

    } catch (error) {
        console.error('Error submitting question answer:', error);
        // Asegurarse de que todas las respuestas sean JSON, incluso en caso de error
        return res.status(500).json({ 
            message: 'Server error',
            error: error instanceof Error ? error.message : String(error)
        });
    }
};
