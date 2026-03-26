import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import rateLimit from 'express-rate-limit';

import problemRoutes from './src/routes/problem.routes';
import aiRoutes from './src/routes/ai.routes';

dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') });
if (!process.env.SUPABASE_URL) {
    dotenv.config(); // Fallback to root .env
}

console.log('--- BACKEND STARTING ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL:', process.env.VERCEL);
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'PRESENT' : 'MISSING');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'PRESENT' : 'MISSING');
console.log('------------------------');

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

// Health and Diagnostics
app.get('/api/v1/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: {
            SUPABASE_URL: !!process.env.SUPABASE_URL ? 'present' : 'missing',
            SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY ? 'present' : 'missing',
            GEMINI_API_KEY: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY) ? 'present' : 'missing',
            NODE_ENV: process.env.NODE_ENV,
        }
    });
});

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

// Change: Wrap this in a conditional for Vercel and separate processes
// Vercel handles the listening; manual app.listen() causes 500 errors on deployment
// Also prevent listening if this file is imported (e.g. by Next.js API routes)
const isMainModule = typeof require !== 'undefined' && require.main === module;
const isDirectRun = process.env.RUN_SERVER === 'true' || isMainModule;

if (isDirectRun && !process.env.VERCEL && (process.env.NODE_ENV !== 'production' || process.env.VERCEL_DEV)) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;

