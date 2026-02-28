import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import snippetRoutes from './routes/snippetRoutes.js';

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/snippets', snippetRoutes);

// Root endpoint para verificar salud de la API
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use(errorHandler);

export default app;
