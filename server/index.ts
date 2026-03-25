import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import problemRoutes from './src/routes/problem.routes';
import aiRoutes from './src/routes/ai.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate Limiting — 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again after 15 minutes.' },
});

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use('/api/', apiLimiter);

// Routes
app.use('/api/v1/problems', problemRoutes);
app.use('/api/v1/ai', aiRoutes);

// Public API endpoints
app.get('/api/problems', async (req, res) => {
    res.json({ message: 'Use /api/v1/problems for full problem data' });
});

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Problem Map API',
        version: '1.0.0',
        endpoints: {
            problems: '/api/v1/problems',
            problemById: '/api/v1/problems/:id',
        },
        rateLimit: '100 requests per 15 minutes',
    });
});

// Change: Wrap this in a conditional for Vercel
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL_DEV) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;

