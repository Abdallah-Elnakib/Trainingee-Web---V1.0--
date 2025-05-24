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
exports.studentDashboard = void 0;
const studentDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Simple rendering of the student dashboard page
        // The actual data will be fetched from the frontend via API
        res.render('student-dashboard');
    }
    catch (error) {
        console.error('Error rendering student dashboard:', error);
        res.status(500).send('Internal Server Error');
    }
});
exports.studentDashboard = studentDashboard;
