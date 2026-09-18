import { Router } from 'express';
import {
  getMemories,
  createMemory,
  updateMemory,
  deleteMemory,
  clearAllMemories,
  getMemoryStats
} from '../controllers/memoryController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', getMemories);
router.post('/', createMemory);
router.get('/stats', getMemoryStats);
router.delete('/', clearAllMemories);
router.patch('/:id', updateMemory);
router.delete('/:id', deleteMemory);

export default router;
