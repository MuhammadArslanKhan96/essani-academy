import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and Password are required.' });
    }

    const trimmed = email.trim().toLowerCase();
    const isMatch = trimmed.includes('arsalan') || trimmed.includes('admin') || trimmed === '03322454401' || trimmed === 'arsalan.qasim@essani.edu.pk';

    if (isMatch && password === 'admin') {
      let schoolName = 'Essani Children Academy';
      let adminPhone = '0332 2454401';
      let adminName = 'Muhammad Arsalan Qasim';

      try {
        const school = await prisma.school.findFirst();
        if (school) {
          schoolName = school.name;
          adminPhone = school.phone;
          adminName = school.administrator;
        }
      } catch (err) {
        // Fallback to configured school details if DB connection fails
      }

      return res.json({
        success: true,
        message: 'Authentication successful',
        user: {
          name: adminName,
          title: 'Administrator & Owner',
          email: 'arsalan.qasim@essani.edu.pk',
          phone: adminPhone,
          school: schoolName,
          systems: ['Matriculation', 'O-Levels']
        },
        token: 'essani_session_token_arsalan_qasim'
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials. Password is "admin"' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

export const getHealth = async (req: Request, res: Response) => {
  return res.json({
    status: 'online',
    school: 'Essani Children Academy',
    systems: ['Matriculation', 'O-Levels'],
    timestamp: new Date().toISOString()
  });
};
