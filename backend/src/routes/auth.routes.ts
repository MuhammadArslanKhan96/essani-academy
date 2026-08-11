import { Router } from 'express';
import { login, getHealth } from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', login);
router.get('/health', getHealth);

export default router;
