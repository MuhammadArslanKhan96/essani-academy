import { Router } from 'express';
import { getSystems } from '../controllers/system.controller.js';

const router = Router();

router.get('/', getSystems);

export default router;
