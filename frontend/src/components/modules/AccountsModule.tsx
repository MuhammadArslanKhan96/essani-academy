import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TrendingUp, PlusCircle, ArrowUpRight, ArrowDownRight, X } from 'lucide-react';
import { SystemType } from '../../App';
import { Pagination } from '../common/Pagination';

interface Transaction {
  id: string;
  title: string;
  category: string;
  type: 'Income' | 'Expenditure';
  amount: number;
  systemType: string;
  date: string;
}

interface AccountsModuleProps {
  activeSystem: SystemType;
  activeSession: string;
}

export const AccountsModule: React.FC<AccountsModuleProps> = ({ activeSystem, activeSession }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Salaries');
  const [type, setType] = useState<'Income' | 'Expenditure'>('Expenditure');
  const [amount, setAmount] = useState('');
  const [systemType, setSystemType] = useState<string>('Matriculation');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeSystem !== 'All') params.append('systemType', activeSystem);
      if (activeSession) params.append('session', activeSession);

      const url = `/api/accounts?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    setCurrentPage(1);
  }, [activeSystem, activeSession]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          type,
          amount: parseFloat(amount),
          systemType,
          session: activeSession
        })
      });

      const data = await res.json();
      if (data.success) {
        setTitle('');
        setAmount('');
        setShowModal(false);
        fetchTransactions();
      }
    } catch (err) {
      console.error('Error recording transaction:', err);
    }
  };

  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenditure = transactions.filter(t => t.type === 'Expenditure').reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpenditure;

  return (
    <div className="animate-fade-in" style={{ padding: '0 0 24px 0' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', color: '#1E1B4B', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp color="#D4AF37" size={28} /> All Income & Expenditure Software
          </h2>
          <p style={{ color: 'var(--card-subtext)', fontSize: '0.9rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Financial Ledger: <span className="gold-badge">{activeSystem === 'All' ? 'Matriculation & O-Levels' : `${activeSystem} System`}</span>
            <span className="gold-badge" style={{ background: 'rgba(255, 215, 0, 0.1)', color: '#D4AF37', border: '1px solid #D4AF37' }}>
              Session: {activeSession}
            </span>
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="gold-button" style={{ padding: '12px 22px', fontSize: '0.9rem' }}>
          <PlusCircle size={18} /> Record Transaction
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        
        <div className="white-card" style={{ padding: '24px', borderTop: '4px solid #10B981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>TOTAL INCOME ({activeSystem})</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#DEF7EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowUpRight color="#10B981" size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10B981', marginTop: '8px' }}>
            Rs. {totalIncome.toLocaleString()}
          </div>
        </div>

        <div className="white-card" style={{ padding: '24px', borderTop: '4px solid #EF4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: '#B91C1C', fontWeight: 700, textTransform: 'uppercase' }}>TOTAL EXPENDITURE ({activeSystem})</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#FDE8E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowDownRight color="#EF4444" size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#EF4444', marginTop: '8px' }}>
            Rs. {totalExpenditure.toLocaleString()}
          </div>
        </div>

        <div className="white-card" style={{ padding: '24px', borderTop: '4px solid var(--gold-primary)', background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFBEB 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--bg-purple-main)', fontWeight: 700, textTransform: 'uppercase' }}>NET CASH BALANCE</span>
            <span className="gold-badge">Net Surplus</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: netBalance >= 0 ? 'var(--bg-purple-main)' : '#EF4444', marginTop: '8px' }}>
            Rs. {netBalance.toLocaleString()}
          </div>
        </div>

      </div>

      {/* Add Entry Modal */}
      {showModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card animate-fade-in" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <TrendingUp color="#D4AF37" size={22} /> RECORD FINANCIAL ENTRY
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="custom-input-group">
                    <label className="custom-input-label">Academic System</label>
                    <select
                      className="custom-input"
                      value={systemType}
                      onChange={(e) => setSystemType(e.target.value)}
                    >
                      <option value="Matriculation">Matriculation System</option>
                      <option value="O-Levels">O-Levels System</option>
                      <option value="All">All School General</option>
                    </select>
                  </div>

                  <div className="custom-input-group">
                    <label className="custom-input-label">Entry Type</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setType('Income')}
                        style={{
                          flex: 1, padding: '8px 4px', borderRadius: '8px', border: 'none',
                          background: type === 'Income' ? '#10B981' : '#E2E8F0',
                          color: type === 'Income' ? '#FFFFFF' : '#4A5568',
                          fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem'
                        }}
                      >
                        Income (+)
                      </button>
                      <button
                        type="button"
                        onClick={() => setType('Expenditure')}
                        style={{
                          flex: 1, padding: '8px 4px', borderRadius: '8px', border: 'none',
                          background: type === 'Expenditure' ? '#EF4444' : '#E2E8F0',
                          color: type === 'Expenditure' ? '#FFFFFF' : '#4A5568',
                          fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem'
                        }}
                      >
                        Expense (-)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="custom-input-group">
                  <label className="custom-input-label">Description *</label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="e.g. Science Lab Equipment / Electricity Bill"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="custom-input-group" style={{ marginBottom: 0 }}>
                    <label className="custom-input-label">Category</label>
                    <select
                      className="custom-input"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="Tuition Fees">Tuition Fees</option>
                      <option value="Salaries">Teacher / Staff Salaries</option>
                      <option value="Utilities">Utilities (Electric/Gas)</option>
                      <option value="Lab & Stationery">Lab Supplies & Stationery</option>
                      <option value="Building Repairs">Building Repairs</option>
                      <option value="Other">Other Expenses</option>
                    </select>
                  </div>

                  <div className="custom-input-group" style={{ marginBottom: 0 }}>
                    <label className="custom-input-label">Amount (PKR) *</label>
                    <input
                      type="number"
                      className="custom-input"
                      placeholder="e.g. 5000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 20px', borderRadius: '10px',
                    border: '1px solid #CBD5E0', background: '#EDF2F7', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="gold-button" style={{ padding: '10px 22px' }}>
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}


      {/* Ledger Table */}
      <div className="white-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-purple-main)', color: '#FFFFFF', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '16px 20px' }}>Date</th>
              <th style={{ padding: '16px 20px' }}>Description</th>
              <th style={{ padding: '16px 20px' }}>System & Category</th>
              <th style={{ padding: '16px 20px' }}>Type</th>
              <th style={{ padding: '16px 20px', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#A0AEC0' }}>
                  Loading transactions from backend API...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#A0AEC0' }}>
                  No financial transactions logged yet. Click "Record Transaction" to add an entry.
                </td>
              </tr>
            ) : paginatedTransactions.map((tx, idx) => (
              <tr key={tx.id} style={{ borderBottom: '1px solid #EDF2F7', background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: '#718096' }}>{tx.date}</td>
                <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--bg-purple-main)' }}>{tx.title}</td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span className="gold-badge" style={{ background: 'rgba(59, 10, 69, 0.06)', color: 'var(--bg-purple-main)' }}>
                      {tx.systemType}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#718096' }}>{tx.category}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  {tx.type === 'Income' ? (
                    <span style={{ color: '#10B981', fontWeight: 700, fontSize: '0.85rem' }}>+ Income</span>
                  ) : (
                    <span style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.85rem' }}>- Expense</span>
                  )}
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 800, color: tx.type === 'Income' ? '#10B981' : '#EF4444' }}>
                  {tx.type === 'Income' ? '+' : '-'} Rs. {tx.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalItems={transactions.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

    </div>
  );
};
