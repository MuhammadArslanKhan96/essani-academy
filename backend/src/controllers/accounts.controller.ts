import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

let liveTransactionsStore: any[] = [];

export const getTransactions = async (req: Request, res: Response) => {
  const { systemType, session } = req.query;
  try {
    const where: any = {};
    if (systemType && systemType !== 'All') {
      where.OR = [{ systemType: { equals: String(systemType), mode: 'insensitive' } }, { systemType: 'All' }];
    }
    if (session) {
      where.session = String(session);
    }
    const transactions = await prisma.transaction.findMany({ where, orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, transactions, data: transactions });
  } catch (error) {
    let result = liveTransactionsStore;
    if (systemType && systemType !== 'All') {
      result = result.filter(t => t.systemType.toLowerCase() === String(systemType).toLowerCase() || t.systemType === 'All');
    }
    if (session) {
      result = result.filter(t => !t.session || t.session === String(session));
    }
    return res.json({ success: true, transactions: result, data: result });
  }
};

export const createTransaction = async (req: Request, res: Response) => {
  const { title, category, type, amount, systemType, session } = req.body;
  if (!title || !amount) {
    return res.status(400).json({ success: false, message: 'Title and amount are required.' });
  }

  const newTx = {
    id: `T${Date.now().toString().slice(-4)}`,
    title,
    category: category || 'Other',
    type: type || 'Expenditure',
    amount: parseFloat(amount),
    systemType: systemType || 'All',
    session: session || '2025-2026',
    date: new Date().toISOString().split('T')[0]
  };

  try {
    const transaction = await prisma.transaction.create({ data: newTx });
    return res.status(201).json({ success: true, message: 'Financial entry recorded', transaction, data: transaction });
  } catch (error) {
    liveTransactionsStore.unshift(newTx);
    return res.status(201).json({ success: true, message: 'Financial entry recorded successfully', transaction: newTx, data: newTx });
  }
};
