import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import chatRoutes from './routes/chat.routes.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();

app.use(
  cors({
    origin: env.frontendOrigin,
  }),
);

app.use(express.json({ limit: '100kb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/chat', chatRoutes);

app.use(errorMiddleware);

export default app;
