import { Router } from 'express';
import { getStudents, createStudent, createStudentsBulk, deleteStudent } from '../controllers/student.controller.js';

const router = Router();

router.get('/', getStudents);
router.post('/', createStudent);
router.post('/bulk', createStudentsBulk);
router.delete('/:id', deleteStudent);

export default router;
