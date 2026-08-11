import React, { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  CreditCard, 
  Clock, 
  TrendingUp,
  CheckCircle,
  Calendar
} from 'lucide-react';
import logoImg from '../assets/school_logo.png';
import { SystemType } from '../App';

interface DashboardProps {
  user: any;
  activeSystem: SystemType;
  activeSession: string;
  onNavigate: (module: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, activeSystem, activeSession, onNavigate }) => {
  const [studentCount, setStudentCount] = useState<number>(0);
  const [collectedFees, setCollectedFees] = useState<number>(0);
  const [attendanceRate, setAttendanceRate] = useState<string>('0%');
  const [netBalance, setNetBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (activeSystem !== 'All') params.append('systemType', activeSystem);
        if (activeSession) params.append('session', activeSession);
        const queryStr = params.toString() ? `?${params.toString()}` : '';
        
        // Fetch Students count
        const stdRes = await fetch(`/api/students${queryStr}`);
        const stdData = await stdRes.json();
        if (stdData.success && Array.isArray(stdData.students)) {
          setStudentCount(stdData.students.length);
        }

        // Fetch Fee collection total
        const feeRes = await fetch(`/api/fees${queryStr}`);
        const feeData = await feeRes.json();
        if (feeData.success && Array.isArray(feeData.fees)) {
          const totalPaid = feeData.fees
            .filter((f: any) => f.status === 'Paid')
            .reduce((sum: number, f: any) => sum + (f.amount || 0), 0);
          setCollectedFees(totalPaid);
        }

        // Fetch Attendance rate
        const attRes = await fetch(`/api/attendance${queryStr}`);
        const attData = await attRes.json();
        if (attData.success && Array.isArray(attData.attendance) && attData.attendance.length > 0) {
          const present = attData.attendance.filter((a: any) => a.status === 'Present').length;
          const rate = Math.round((present / attData.attendance.length) * 100);
          setAttendanceRate(`${rate}%`);
        } else {
          setAttendanceRate('0%');
        }

        // Fetch Financial Net Surplus
        const accRes = await fetch(`/api/accounts${queryStr}`);
        const accData = await accRes.json();
        if (accData.success && Array.isArray(accData.transactions)) {
          const income = accData.transactions.filter((t: any) => t.type === 'Income').reduce((sum: number, t: any) => sum + t.amount, 0);
          const expenditure = accData.transactions.filter((t: any) => t.type === 'Expenditure').reduce((sum: number, t: any) => sum + t.amount, 0);
          setNetBalance(income - expenditure);
        }

      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [activeSystem, activeSession]);

  const stats = [
    { title: `Students (${activeSystem})`, value: loading ? '...' : `${studentCount}`, icon: GraduationCap },
    { title: `Fee Collected (${activeSystem})`, value: loading ? '...' : `Rs. ${collectedFees.toLocaleString()}`, icon: CreditCard },
    { title: 'Daily Attendance Rate', value: loading ? '...' : attendanceRate, icon: Clock },
    { title: 'Net Financial Surplus', value: loading ? '...' : `Rs. ${netBalance.toLocaleString()}`, icon: TrendingUp },
  ];

  const modules = [
    { id: 'students', title: 'Direct Student Add/Remove', desc: 'Add or remove students directly in Matriculation or O-Levels tracks', icon: Users, badge: 'Direct' },
    { id: 'fees', title: 'Fee Collection & WhatsApp', desc: 'Track system fee vouchers and send automated WhatsApp payment receipts', icon: CreditCard, badge: 'WhatsApp' },
    { id: 'attendance', title: 'Teacher & Student Attendance', desc: 'Daily attendance logs for teachers and students across both tracks', icon: Clock },
    { id: 'accounts', title: 'Income & Expenditure Software', desc: 'Record system-wise income, lab expenses, utility bills & staff salaries', icon: TrendingUp },
  ];

  return (
    <div className="animate-fade-in" style={{ padding: '0 0 24px 0' }}>
      
      {/* Welcome Banner */}
      <div className="white-card" style={{ padding: '32px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'var(--bg-purple-main)',
              border: '3px solid var(--gold-primary)',
              padding: '5px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
              flexShrink: 0
            }}>
              <img src={logoImg} alt="Essani Academy Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <span className="gold-badge">System: {activeSystem === 'All' ? 'Matriculation & O-Levels' : activeSystem}</span>
                <span className="gold-badge" style={{ background: 'rgba(255, 215, 0, 0.1)', color: '#FFD700', border: '1px solid #FFD700' }}>
                  <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} /> Session: {activeSession}
                </span>
                <span style={{ fontSize: '0.82rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  <CheckCircle size={14} /> Backend Connected
                </span>
              </div>
              <h2 style={{ fontSize: '1.65rem', color: '#1E1B4B', fontWeight: 800, margin: 0 }}>
                Welcome, {user?.name || 'Muhammad Arsalan Qasim'}
              </h2>
              <p style={{ color: 'var(--card-subtext)', marginTop: '4px', fontSize: '0.9rem' }}>
                Essani Children Academy • Dual Academic Track System (Matriculation & O-Levels)
              </p>
            </div>
          </div>

          <div>
            <button onClick={() => onNavigate('students')} className="gold-button" style={{ padding: '12px 22px', fontSize: '0.9rem' }}>
              + Direct Add Student
            </button>
          </div>

        </div>
      </div>

      {/* Dynamic KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {stats.map((stat, idx) => {
          const IconComp = stat.icon;
          return (
            <div key={idx} className="white-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: 'rgba(212, 175, 55, 0.12)', border: '1px solid rgba(212, 175, 55, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <IconComp size={24} color="#3B0A45" />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--card-subtext)', fontWeight: 600, textTransform: 'uppercase' }}>
                  {stat.title}
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1E1B4B', marginTop: '2px' }}>
                  {stat.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Management Modules Grid */}
      <h3 style={{ fontSize: '1.15rem', marginBottom: '20px', color: '#1E1B4B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        CORE MANAGEMENT MODULES ({activeSystem.toUpperCase()} • SESSION {activeSession})
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        {modules.map((mod) => {
          const IconComp = mod.icon;
          return (
            <div
              key={mod.id}
              onClick={() => onNavigate(mod.id)}
              className="white-card"
              style={{ padding: '24px', cursor: 'pointer', position: 'relative' }}
            >
              {mod.badge && (
                <span style={{
                  position: 'absolute', top: '20px', right: '20px',
                  fontSize: '0.7rem', fontWeight: 700,
                  background: 'var(--gold-gradient)', color: '#24042C',
                  padding: '2px 8px', borderRadius: '10px'
                }}>
                  {mod.badge}
                </span>
              )}
              <div style={{
                width: '46px', height: '46px', borderRadius: '12px',
                background: 'var(--gold-gradient)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px', boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
              }}>
                <IconComp size={22} color="#2A0633" />
              </div>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--bg-purple-main)', fontWeight: 700, marginBottom: '6px' }}>
                {mod.title}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--card-subtext)', lineHeight: 1.4 }}>
                {mod.desc}
              </p>
            </div>
          );
        })}
      </div>

    </div>
  );
};
