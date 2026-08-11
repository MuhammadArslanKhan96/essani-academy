import { Router } from 'express';
import { getAttendance, saveAttendance } from '../controllers/attendance.controller.js';

const router = Router();

router.get('/', getAttendance);
router.post('/', saveAttendance);

export default router;
