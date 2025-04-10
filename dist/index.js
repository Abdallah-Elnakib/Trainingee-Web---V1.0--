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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const connDB_1 = require("./config/connDB");
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const authRouter_1 = __importDefault(require("./router/authRouter"));
const TracksRouter_1 = __importDefault(require("./router/TracksRouter"));
const studentsRouter_1 = __importDefault(require("./router/studentsRouter"));
exports.app = (0, express_1.default)();
(0, connDB_1.connDB)();
exports.app.use(express_1.default.json());
exports.app.use((0, cors_1.default)());
exports.app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));
exports.app.use(express_1.default.static('public'));
exports.app.use('/api/auth', authRouter_1.default);
exports.app.use('/api/tracks', TracksRouter_1.default);
exports.app.use('/api/students', studentsRouter_1.default);
mongoose_1.default.connection.once('open', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Database connected successfully...................');
    const port = process.env.PORT || 3000;
    exports.app.listen(port, () => {
        console.log(`🚀 Server is running on port ${port}...........`);
    });
}));
mongoose_1.default.connection.on('error', (error) => {
    console.error('Database connection failed:', error);
});
