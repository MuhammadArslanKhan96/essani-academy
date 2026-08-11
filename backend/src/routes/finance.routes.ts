import { Router } from 'express';
import { getFees, markFeePaid } from '../controllers/finance.controller.js';

const router = Router();

router.get('/', getFees);
router.post('/:id/pay', markFeePaid);

export default router;
