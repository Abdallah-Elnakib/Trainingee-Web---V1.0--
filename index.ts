import express, { Request, Response, Express } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { connDB } from './config/connDB';
import cors from 'cors';
import session from 'express-session';
import path from 'path';
import auth from './router/authRouter';
import tracks from './router/TracksRouter'
import students from './router/studentsRouter'
import { home } from './controllers/authControllers/getReq/homeController';
import { tracksPage } from './controllers/tracksControllers/getReq/tracksController';
import { studentsPage } from './controllers/studentsControllers/getReq/studentsPageController';
import { verifyJWT } from './middleware/verifyJWT';



export const app: Express = express();

connDB();

// Configurar el motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views')); // Ajuste de ruta para apuntar a la carpeta views desde dist

app.use(express.json());
app.use(cors());
app.use(session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
  }));
  
app.use(express.static('public'));

// API Routes
app.use('/api/auth', auth);
app.use('/api/tracks', tracks)
app.use('/api/students', students)


app.get('/', verifyJWT, home);
app.get('/tracks', verifyJWT, tracksPage);
app.get('/students', verifyJWT, studentsPage);

mongoose.connection.once('open', async () => {
    console.log('Database connected successfully...................');
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`🚀 Server is running on port ${port}...........`);
    });
});


mongoose.connection.on('error', (error) => {
    console.error('Database connection failed:', error);
});


