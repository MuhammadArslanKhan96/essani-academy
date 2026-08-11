import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

let liveFeesStore: any[] = [];

export const getFees = async (req: Request, res: Response) => {
  const { systemType, session } = req.query;
  try {
    const where: any = {};
    if (systemType && systemType !== 'All') {
      where.systemType = { equals: String(systemType), mode: 'insensitive' };
    }
    if (session) {
      where.session = String(session);
    }
    const fees = await prisma.feeRecord.findMany({ where, orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, fees, data: fees });
  } catch (error) {
    let result = liveFeesStore;
    if (systemType && systemType !== 'All') {
      result = result.filter(f => f.systemType.toLowerCase() === String(systemType).toLowerCase());
    }
    if (session) {
      result = result.filter(f => !f.session || f.session === String(session));
    }
    return res.json({ success: true, fees: result, data: result });
  }
};

export const markFeePaid = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const today = new Date().toISOString().split('T')[0];

  try {
    const fee = await prisma.feeRecord.update({
      where: { id },
      data: { status: 'Paid', paidDate: today }
    });
    return res.json({ success: true, message: 'Fee payment updated to Paid', fee, data: fee });
  } catch (error) {
    const idx = liveFeesStore.findIndex(f => f.id === id);
    if (idx !== -1) {
      liveFeesStore[idx].status = 'Paid';
      liveFeesStore[idx].paidDate = today;
      return res.json({ success: true, message: 'Fee payment updated to Paid', fee: liveFeesStore[idx], data: liveFeesStore[idx] });
    }
    return res.status(404).json({ success: false, message: 'Fee record not found' });
  }
};
