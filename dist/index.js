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
const path_1 = __importDefault(require("path"));
const authRouter_1 = __importDefault(require("./router/authRouter"));
const TracksRouter_1 = __importDefault(require("./router/TracksRouter"));
// Importación con nombre exacto para evitar problemas de mayúsculas/minúsculas
const studentsRouter_js_1 = __importDefault(require("./router/studentsRouter.js"));
const homeController_1 = require("./controllers/authControllers/getReq/homeController");
const tracksController_1 = require("./controllers/tracksControllers/getReq/tracksController");
const studentsPageController_1 = require("./controllers/studentsControllers/getReq/studentsPageController");
const verifyJWT_1 = require("./middleware/verifyJWT");
exports.app = (0, express_1.default)();
(0, connDB_1.connDB)();
// Configurar el motor de plantillas EJS
exports.app.set('view engine', 'ejs');
exports.app.set('views', path_1.default.join(__dirname, '../views')); // Ajuste de ruta para apuntar a la carpeta views desde dist
exports.app.use(express_1.default.json());
exports.app.use((0, cors_1.default)());
exports.app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));
exports.app.use(express_1.default.static('public'));
// API Routes
exports.app.use('/api/auth', authRouter_1.default);
exports.app.use('/api/tracks', TracksRouter_1.default);
exports.app.use('/api/students', studentsRouter_js_1.default);
exports.app.get('/', verifyJWT_1.verifyJWT, homeController_1.home);
exports.app.get('/tracks', verifyJWT_1.verifyJWT, tracksController_1.tracksPage);
exports.app.get('/students', verifyJWT_1.verifyJWT, studentsPageController_1.studentsPage);
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
