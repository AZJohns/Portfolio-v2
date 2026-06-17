import { Router } from 'express';
import { handleChatMessage } from '../controllers/chat.controller.js';
import { rateLimitMiddleware } from '../middlewares/rate-limit.middleware.js';

const router = Router();

router.post('/', rateLimitMiddleware, handleChatMessage);

export default router;
