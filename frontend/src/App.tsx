import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Sidebar, ModuleType } from './components/Sidebar';
import { LoginCard } from './components/LoginCard';
import { Dashboard } from './components/Dashboard';
import { StudentsModule } from './components/modules/StudentsModule';
import { FeeCollectionModule } from './components/modules/FeeCollectionModule';
import { AttendanceModule } from './components/modules/AttendanceModule';
import { AccountsModule } from './components/modules/AccountsModule';
import logoImg from './assets/school_logo.png';
import { Phone, Layers, Calendar, PlusCircle, CheckCircle, X } from 'lucide-react';


export type SystemType = 'All' | 'Matriculation' | 'O-Levels';

export interface AcademicSession {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleType>('dashboard');
  const [activeSystem, setActiveSystem] = useState<SystemType>('All');
  
  // Dynamic Academic Years / Sessions List
  const [sessions, setSessions] = useState<AcademicSession[]>([
    { id: '1', title: '2025-2026', startDate: '2025-08-01', endDate: '2026-06-30', status: 'active' },
    { id: '2', title: '2026-2027', startDate: '2026-08-01', endDate: '2027-06-30', status: 'active' },
    { id: '3', title: '2024-2025', startDate: '2024-08-01', endDate: '2025-06-30', status: 'inactive' },
  ]);

  const [activeSession, setActiveSession] = useState<string>('2025-2026');
  
  // Add Session Modal state
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [sessionSuccessMsg, setSessionSuccessMsg] = useState('');

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    setActiveModule('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionTitle) return;

    const newSess: AcademicSession = {
      id: Date.now().toString(),
      title: newSessionTitle,
      startDate: newStartDate || new Date().toISOString().split('T')[0],
      endDate: newEndDate || new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      status: 'active'
    };

    setSessions([newSess, ...sessions]);
    setActiveSession(newSess.title);
    setNewSessionTitle('');
    setNewStartDate('');
    setNewEndDate('');
    setShowAddSessionModal(false);
    setSessionSuccessMsg(`Successfully created and activated new Academic Session: "${newSess.title}"!`);
    setTimeout(() => setSessionSuccessMsg(''), 4000);
  };

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'students':
        return <StudentsModule activeSystem={activeSystem} activeSession={activeSession} />;
      case 'fees':
        return <FeeCollectionModule activeSystem={activeSystem} activeSession={activeSession} />;
      case 'attendance':
        return <AttendanceModule activeSystem={activeSystem} activeSession={activeSession} />;
      case 'accounts':
        return <AccountsModule activeSystem={activeSystem} activeSession={activeSession} />;
      case 'dashboard':
      default:
        return <Dashboard user={currentUser} activeSystem={activeSystem} activeSession={activeSession} onNavigate={(mod) => setActiveModule(mod as ModuleType)} />;
    }
  };

  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{
          background: 'rgba(36, 4, 44, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'var(--bg-purple-main)',
              border: '2px solid var(--gold-primary)',
              padding: '3px'
            }}>
              <img src={logoImg} alt="Essani Children Academy" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <h1 className="gold-heading" style={{ fontSize: '1.15rem', margin: 0 }}>
                ESSANI CHILDREN ACADEMY
              </h1>
              <div style={{ fontSize: '0.78rem', color: '#D1D5DB' }}>
                Matriculation & O-Levels • Garden West, Karachi
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#E5E7EB', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Phone size={14} color="#D4AF37" /> 0332 2454401
          </div>
        </header>

        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoginCard onLoginSuccess={handleLoginSuccess} />
        </main>

        <footer style={{
          textAlign: 'center',
          padding: '16px',
          fontSize: '0.8rem',
          color: 'rgba(255, 255, 255, 0.4)',
          borderTop: '1px solid rgba(212, 175, 55, 0.1)'
        }}>
          Essani Children Academy (Matriculation & O-Levels) © {new Date().getFullYear()}
        </footer>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        user={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        
        {/* Sticky Header with Academic System & Session Switchers */}
        <header style={{
          background: 'rgba(42, 6, 51, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
          padding: '12px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginLeft: 'auto' }}>
            
            {/* Academic Session Selector & + Add Academic Year */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 0, 0, 0.35)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
              <Calendar size={14} color="#D4AF37" />
              <span style={{ fontSize: '0.78rem', color: '#D4AF37', fontWeight: 700 }}>Session:</span>
              <select
                value={activeSession}
                onChange={(e) => {
                  if (e.target.value === '__add_new__') {
                    setShowAddSessionModal(true);
                  } else {
                    setActiveSession(e.target.value);
                  }
                }}
                style={{
                  background: 'transparent',
                  color: '#FFD700',
                  border: 'none',
                  outline: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.title} style={{ background: '#2A0633', color: '#FFFFFF' }}>
                    Academic Year: {s.title}
                  </option>
                ))}
                <option value="__add_new__" style={{ background: '#3B0A45', color: '#FFD700', fontWeight: 'bold' }}>
                  + Add New Academic Year
                </option>
              </select>

              <button
                type="button"
                onClick={() => setShowAddSessionModal(true)}
                title="Add New Academic Year"
                style={{
                  background: 'var(--gold-gradient)',
                  border: 'none',
                  color: '#24042C',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <PlusCircle size={12} /> Add
              </button>
            </div>

            {/* Academic System Switcher: All Systems | Matriculation | O-Levels */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 0, 0, 0.35)', padding: '4px 8px', borderRadius: '14px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
              <Layers size={14} color="#D4AF37" style={{ marginLeft: '4px' }} />
              <span style={{ fontSize: '0.78rem', color: '#D4AF37', fontWeight: 700, marginRight: '4px' }}>System:</span>

              {(['All', 'Matriculation', 'O-Levels'] as SystemType[]).map((sys) => (
                <button
                  key={sys}
                  onClick={() => setActiveSystem(sys)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '10px',
                    border: activeSystem === sys ? '1px solid var(--gold-primary)' : '1px solid transparent',
                    background: activeSystem === sys ? 'var(--gold-gradient)' : 'transparent',
                    color: activeSystem === sys ? '#24042C' : '#E5E7EB',
                    fontWeight: activeSystem === sys ? 700 : 500,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {sys === 'All' ? 'All Systems' : sys}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Global Session Notification Banner */}
        {sessionSuccessMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.9)',
            color: '#FFFFFF',
            padding: '10px 32px',
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle size={16} /> {sessionSuccessMsg}
          </div>
        )}

        {/* Add Academic Year Modal */}
        {showAddSessionModal && createPortal(
          <div className="modal-overlay" onClick={() => setShowAddSessionModal(false)}>
            <div className="modal-card animate-fade-in" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-header-title">
                  <Calendar color="#D4AF37" size={22} /> ADD NEW ACADEMIC YEAR
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setShowAddSessionModal(false)}
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <div className="modal-body">
                  <div className="custom-input-group">
                    <label className="custom-input-label">Academic Year Title *</label>
                    <input
                      type="text"
                      className="custom-input"
                      placeholder="e.g. 2027-2028 or 2028-2029"
                      value={newSessionTitle}
                      onChange={(e) => setNewSessionTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="custom-input-group" style={{ marginBottom: 0 }}>
                      <label className="custom-input-label">Start Date</label>
                      <input
                        type="date"
                        className="custom-input"
                        value={newStartDate}
                        onChange={(e) => setNewStartDate(e.target.value)}
                      />
                    </div>
                    <div className="custom-input-group" style={{ marginBottom: 0 }}>
                      <label className="custom-input-label">End Date</label>
                      <input
                        type="date"
                        className="custom-input"
                        value={newEndDate}
                        onChange={(e) => setNewEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => setShowAddSessionModal(false)}
                    style={{
                      padding: '10px 20px', borderRadius: '10px',
                      border: '1px solid #CBD5E0', background: '#EDF2F7', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="gold-button" style={{ padding: '10px 22px' }}>
                    Create Academic Year
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Dynamic Active Module View */}
        <main style={{ flex: 1, padding: '24px 32px 32px 32px', maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
};

export default App;
