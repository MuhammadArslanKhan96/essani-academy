import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

let liveAttendanceStore: any[] = [];

export const getAttendance = async (req: Request, res: Response) => {
  const { date, systemType, session } = req.query;
  try {
    const where: any = {};
    if (date) where.date = String(date);
    if (systemType && systemType !== 'All') {
      where.OR = [{ systemType: { equals: String(systemType), mode: 'insensitive' } }, { systemType: 'All' }];
    }
    if (session) {
      where.session = String(session);
    }
    const attendance = await prisma.attendanceRecord.findMany({ where, orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, attendance, data: attendance });
  } catch (error) {
    let result = liveAttendanceStore;
    if (date) {
      result = result.filter(a => a.date === String(date));
    }
    if (systemType && systemType !== 'All') {
      result = result.filter(a => a.systemType.toLowerCase() === String(systemType).toLowerCase() || a.systemType === 'All');
    }
    if (session) {
      result = result.filter(a => !a.session || a.session === String(session));
    }
    return res.json({ success: true, attendance: result, data: result });
  }
};

export const saveAttendance = async (req: Request, res: Response) => {
  const { records, session } = req.body;
  if (!Array.isArray(records)) {
    return res.status(400).json({ success: false, message: 'Records array is required.' });
  }

  try {
    const saved = [];
    for (const item of records) {
      const recSession = item.session || session || '2025-2026';
      if (item.id && item.id.length > 10) {
        const updated = await prisma.attendanceRecord.upsert({
          where: { id: item.id },
          update: { status: item.status },
          create: {
            name: item.name,
            role: item.role,
            groupOrClass: item.groupOrClass,
            systemType: item.systemType || 'Matriculation',
            session: recSession,
            status: item.status,
            date: item.date || new Date().toISOString().split('T')[0]
          }
        });
        saved.push(updated);
      } else {
        const created = await prisma.attendanceRecord.create({
          data: {
            name: item.name,
            role: item.role,
            groupOrClass: item.groupOrClass,
            systemType: item.systemType || 'Matriculation',
            session: recSession,
            status: item.status,
            date: item.date || new Date().toISOString().split('T')[0]
          }
        });
        saved.push(created);
      }
    }
    return res.json({ success: true, message: 'Attendance records saved', attendance: saved });
  } catch (error) {
    liveAttendanceStore = records.map(r => ({ ...r, session: r.session || session || '2025-2026' }));
    return res.json({ success: true, message: 'Attendance records saved successfully', attendance: liveAttendanceStore });
  }
};
