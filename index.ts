import express, { Request, Response, Express } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { connDB } from './config/connDB';
import cors from 'cors';
import session from 'express-session';
import auth from './router/authRouter';

export const app: Express = express();

connDB();

app.use(express.json());
app.use(cors());
app.use(session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
  }));
  

app.use('/api/auth', auth);

mongoose.connection.once('open', () => {
    console.log('Database connected successfully...................');
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`🚀 Server is running on port ${port}...........`);
    });
});


mongoose.connection.on('error', (error) => {
    console.error('Database connection failed:', error);
});