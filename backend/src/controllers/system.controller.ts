import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export const getSystems = async (req: Request, res: Response) => {
  try {
    let systems = await prisma.academicSystem.findMany();
    if (systems.length === 0) {
      systems = [
        { id: 'sys-matric', name: 'Matriculation', code: 'MATRIC', description: 'Nursery to Class 10 (Matriculation Board)', schoolId: null, createdAt: new Date(), updatedAt: new Date() },
        { id: 'sys-olevel', name: 'O-Levels', code: 'OLEVEL', description: 'Grade 6 to O-3 (Cambridge GCE System)', schoolId: null, createdAt: new Date(), updatedAt: new Date() }
      ];
    }
    return res.json({ success: true, systems });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch academic systems', error: error.message });
  }
};
