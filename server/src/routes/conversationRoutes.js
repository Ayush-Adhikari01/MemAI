import { Router } from 'express';
import {
  getConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation
} from '../controllers/conversationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', getConversations);
router.post('/', createConversation);
router.get('/:id', getConversation);
router.patch('/:id', updateConversation);
router.delete('/:id', deleteConversation);

export default router;
