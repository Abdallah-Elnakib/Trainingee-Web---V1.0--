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
exports.testSubmission = void 0;
/**
 * Controlador simplificado para pruebas de envío de respuestas
 * Este controlador no requiere autenticación ni validación compleja
 * Solo registra los datos recibidos y devuelve una respuesta exitosa
 */
const testSubmission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Log para depuración - muestra todo lo que recibimos
        console.log('Test Submission Received:', {
            body: req.body,
            method: req.method,
            url: req.url,
            headers: req.headers
        });
        // Extraer datos básicos
        const { answer, questionIndex } = req.body;
        // Evaluar respuesta con un algoritmo muy simple
        let score = 0;
        let feedback = '';
        if (!answer || answer.trim() === '') {
            score = 0;
            feedback = 'No answer provided.';
        }
        else if (answer.length < 10) {
            score = 40;
            feedback = 'Your answer is too brief.';
        }
        else if (answer.length < 50) {
            score = 70;
            feedback = 'Good answer, but could provide more detail.';
        }
        else {
            score = 95;
            feedback = 'Excellent detailed answer!';
        }
        // Simular un retraso para que parezca que está evaluando
        yield new Promise(resolve => setTimeout(resolve, 500));
        // Devolver respuesta exitosa siempre
        res.status(200).json({
            success: true,
            message: 'Answer received and evaluated',
            score,
            feedback,
            maxScore: 100,
            questionIndex
        });
    }
    catch (error) {
        // Capturar cualquier error y mostrar detalles para diagnóstico
        console.error('Error in test submission controller:', error);
        res.status(200).json({
            success: false,
            message: 'Captured error, but returning 200 status for testing',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
exports.testSubmission = testSubmission;
