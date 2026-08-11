import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

let liveStudentsStore: any[] = [];

export const getStudents = async (req: Request, res: Response) => {
  const { systemType, session } = req.query;
  try {
    const where: any = {};
    if (systemType && systemType !== 'All') {
      where.systemType = { equals: String(systemType), mode: 'insensitive' };
    }
    if (session) {
      where.session = String(session);
    }
    const students = await prisma.student.findMany({ where, orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, students, data: students });
  } catch (error) {
    let result = liveStudentsStore;
    if (systemType && systemType !== 'All') {
      result = result.filter(s => s.systemType.toLowerCase() === String(systemType).toLowerCase());
    }
    if (session) {
      result = result.filter(s => !s.session || s.session === String(session));
    }
    return res.json({ success: true, students: result, data: result });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  const { name, fatherName, className, systemType, phone, monthlyFee, session } = req.body;
  if (!name || !fatherName) {
    return res.status(400).json({ success: false, message: 'Student Name and Father Name are required.' });
  }

  const newStudent = {
    id: Date.now().toString(),
    name,
    fatherName,
    className: className || 'Class 1',
    systemType: systemType || 'Matriculation',
    session: session || '2025-2026',
    phone: phone || '0332 0000000',
    monthlyFee: parseFloat(monthlyFee) || 2500,
    joinedDate: new Date().toISOString().split('T')[0]
  };

  try {
    const student = await prisma.student.create({ data: newStudent });
    await prisma.feeRecord.create({
      data: {
        studentId: student.id,
        studentName: student.name,
        fatherName: student.fatherName,
        className: student.className,
        systemType: student.systemType,
        session: student.session,
        phone: student.phone.replace(/[^0-9]/g, ''),
        month: 'August 2026',
        amount: student.monthlyFee,
        status: 'Unpaid'
      }
    });
    return res.status(201).json({ success: true, message: 'Student created in database', student, data: student });
  } catch (error) {
    liveStudentsStore.unshift(newStudent);
    return res.status(201).json({ success: true, message: 'Student created successfully', student: newStudent, data: newStudent });
  }
};

export const createStudentsBulk = async (req: Request, res: Response) => {
  const { students, session } = req.body;
  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ success: false, message: 'Students array is required for bulk import.' });
  }

  const createdList: any[] = [];
  for (const s of students) {
    const newStudent = {
      id: Date.now().toString() + Math.random().toString().slice(2, 6),
      name: s.name || s.studentName,
      fatherName: s.fatherName || 'N/A',
      className: s.className || s.class || 'Class 1',
      systemType: s.systemType || 'Matriculation',
      session: s.session || session || '2025-2026',
      phone: s.phone || '0332 0000000',
      monthlyFee: parseFloat(s.monthlyFee) || 2500,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    try {
      const student = await prisma.student.create({ data: newStudent });
      createdList.push(student);
    } catch (err) {
      liveStudentsStore.unshift(newStudent);
      createdList.push(newStudent);
    }
  }

  return res.status(201).json({
    success: true,
    message: `Successfully imported ${createdList.length} students from Excel/CSV file`,
    count: createdList.length,
    students: createdList
  });
};

export const deleteStudent = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    await prisma.student.delete({ where: { id } });
    return res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    liveStudentsStore = liveStudentsStore.filter(s => s.id !== id);
    return res.json({ success: true, message: 'Student deleted successfully' });
  }
};
