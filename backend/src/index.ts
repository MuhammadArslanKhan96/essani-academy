import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/index.js';
import { seedDatabaseIfEmpty } from './services/seed.service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount modular API Router under /api
app.use('/api', apiRouter);

// Root health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    school: 'Essani Children Academy',
    systems: ['Matriculation', 'O-Levels'],
    timestamp: new Date().toISOString()
  });
});

// Initialize database auto-seed & start server
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  seedDatabaseIfEmpty().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Essani Children Academy Backend running on http://localhost:${PORT}`);
    });
  });
} else {
  seedDatabaseIfEmpty();
}

export default app;
