import { Router } from 'express';
import authRoutes from './auth.routes.js';
import systemRoutes from './system.routes.js';
import studentRoutes from './student.routes.js';
import financeRoutes from './finance.routes.js';
import attendanceRoutes from './attendance.routes.js';
import accountsRoutes from './accounts.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/systems', systemRoutes);
router.use('/students', studentRoutes);
router.use('/fees', financeRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/accounts', accountsRoutes);

export default router;
