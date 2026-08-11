import { Router } from 'express';
import { getTransactions, createTransaction } from '../controllers/accounts.controller.js';

const router = Router();

router.get('/', getTransactions);
router.post('/', createTransaction);

export default router;
