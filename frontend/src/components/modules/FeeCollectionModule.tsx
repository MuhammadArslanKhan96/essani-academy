import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Search, MessageSquare } from 'lucide-react';
import { SystemType } from '../../App';
import { Pagination } from '../common/Pagination';

interface FeeRecord {
  id: string;
  studentName: string;
  className: string;
  systemType: string;
  fatherName: string;
  phone: string;
  month: string;
  amount: number;
  status: 'Paid' | 'Unpaid';
  paidDate?: string;
}

interface FeeCollectionModuleProps {
  activeSystem: SystemType;
  activeSession: string;
}

export const FeeCollectionModule: React.FC<FeeCollectionModuleProps> = ({ activeSystem, activeSession }) => {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchFees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeSystem !== 'All') params.append('systemType', activeSystem);
      if (activeSession) params.append('session', activeSession);
      
      const url = `/api/fees?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setFees(data.fees);
      }
    } catch (err) {
      console.error('Error fetching fees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
    setCurrentPage(1);
  }, [activeSystem, activeSession]);

  const handleMarkAsPaid = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/fees/${id}/pay`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setNotification(`Fee payment marked as paid for ${name}!`);
        fetchFees();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      console.error('Error updating fee:', err);
    }
  };

  const handleWhatsAppSend = (record: FeeRecord) => {
    const formattedPhone = record.phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `*ESSANI CHILDREN ACADEMY*\n` +
      `*System:* ${record.systemType.toUpperCase()}\n` +
      `*Fee Slip Notification - ${record.month}*\n\n` +
      `*Student Name:* ${record.studentName}\n` +
      `*Class:* ${record.className}\n` +
      `*Father Name:* ${record.fatherName}\n` +
      `*Fee Amount:* Rs. ${record.amount.toLocaleString()}\n` +
      `*Status:* ${record.status.toUpperCase()}\n` +
      (record.paidDate ? `*Payment Date:* ${record.paidDate}\n` : `*Due Date:* 10th ${record.month}\n`) +
      `\nFor queries, contact Administrator Muhammad Arsalan Qasim at 0332 2454401.`
    );

    window.open(`https://wa.me/${formattedPhone}?text=${text}`, '_blank');
    setNotification(`WhatsApp fee slip opened for ${record.studentName}`);
    setTimeout(() => setNotification(''), 4000);
  };

  const filteredFees = fees.filter(f =>
    f.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.fatherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedFees = filteredFees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalCollected = filteredFees.filter(f => f.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = filteredFees.filter(f => f.status === 'Unpaid').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="animate-fade-in" style={{ padding: '0 0 24px 0' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', color: '#1E1B4B', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CreditCard color="#D4AF37" size={28} /> Fee Collection & WhatsApp Notices
          </h2>
          <p style={{ color: 'var(--card-subtext)', fontSize: '0.9rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            System Ledger: <span className="gold-badge">{activeSystem === 'All' ? 'Matriculation & O-Levels' : `${activeSystem} System`}</span>
            <span className="gold-badge" style={{ background: 'rgba(255, 215, 0, 0.1)', color: '#D4AF37', border: '1px solid #D4AF37' }}>
              Session: {activeSession}
            </span>
          </p>
        </div>
      </div>

      {notification && (
        <div style={{
          background: 'rgba(59, 10, 69, 0.08)',
          border: '1px solid var(--gold-primary)',
          color: 'var(--bg-purple-main)',
          padding: '12px 20px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600
        }}>
          <CheckCircle size={20} color="#D4AF37" /> {notification}
        </div>
      )}

      {/* Stats KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="white-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--card-subtext)', fontWeight: 600, textTransform: 'uppercase' }}>Collected Fees ({activeSystem})</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>Rs. {totalCollected.toLocaleString()}</div>
        </div>

        <div className="white-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--card-subtext)', fontWeight: 600, textTransform: 'uppercase' }}>Pending Dues ({activeSystem})</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>Rs. {totalPending.toLocaleString()}</div>
        </div>
      </div>

      {/* Search */}
      <div className="white-card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} color="#A0AEC0" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="custom-input"
            style={{ paddingLeft: '42px', padding: '10px 14px 10px 42px' }}
            placeholder="Search by student name, father name, or class..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* Fee Table */}
      <div className="white-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-purple-main)', color: '#FFFFFF', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '16px 20px' }}>Student Info</th>
              <th style={{ padding: '16px 20px' }}>System & Class</th>
              <th style={{ padding: '16px 20px' }}>Month</th>
              <th style={{ padding: '16px 20px' }}>Amount</th>
              <th style={{ padding: '16px 20px' }}>Status</th>
              <th style={{ padding: '16px 20px', textAlign: 'center' }}>WhatsApp Voucher</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#A0AEC0' }}>
                  Loading fee records from backend...
                </td>
              </tr>
            ) : filteredFees.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#A0AEC0' }}>
                  No fee records found for system "{activeSystem}".
                </td>
              </tr>
            ) : paginatedFees.map((f, idx) => (
              <tr key={f.id} style={{ borderBottom: '1px solid #EDF2F7', background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--bg-purple-main)' }}>{f.studentName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#718096' }}>S/O: {f.fatherName}</div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span className="gold-badge" style={{ background: f.systemType === 'O-Levels' ? 'rgba(212, 175, 55, 0.25)' : 'rgba(59, 10, 69, 0.08)', color: 'var(--bg-purple-main)' }}>
                      {f.systemType}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#718096' }}>{f.className}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 20px', fontSize: '0.9rem', color: '#4A5568' }}>{f.month}</td>
                <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--bg-purple-main)' }}>
                  Rs. {f.amount.toLocaleString()}
                </td>
                <td style={{ padding: '16px 20px' }}>
                  {f.status === 'Paid' ? (
                    <span style={{ background: '#DEF7EC', color: '#03543F', fontSize: '0.8rem', fontWeight: 700, padding: '4px 12px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={13} /> Paid ({f.paidDate})
                    </span>
                  ) : (
                    <button
                      onClick={() => handleMarkAsPaid(f.id, f.studentName)}
                      style={{
                        background: '#FEF08A', border: '1px solid #EAB308',
                        color: '#713F12', fontSize: '0.8rem', fontWeight: 700,
                        padding: '4px 12px', borderRadius: '12px', cursor: 'pointer'
                      }}
                    >
                      Mark Paid
                    </button>
                  )}
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleWhatsAppSend(f)}
                    style={{
                      background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                      border: 'none', color: '#FFFFFF', padding: '8px 16px', borderRadius: '10px',
                      fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)'
                    }}
                  >
                    <MessageSquare size={16} /> Send WhatsApp
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredFees.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

    </div>
  );
};
