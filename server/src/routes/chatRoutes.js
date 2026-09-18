import { Router } from 'express';
import { sendMessage } from '../controllers/chatController.js';
import { requireAuth } from '../middleware/auth.js';
import { chatRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(requireAuth);
router.post('/', chatRateLimiter, sendMessage);

export default router;
