import React from 'react';
import logoImg from '../assets/school_logo.png';
import { 
  Users, 
  CreditCard, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  LogOut,
  LayoutDashboard
} from 'lucide-react';

export type ModuleType = 'dashboard' | 'students' | 'fees' | 'attendance' | 'accounts';

interface SidebarProps {
  activeModule: ModuleType;
  setActiveModule: (mod: ModuleType) => void;
  user: any;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  setActiveModule,
  user,
  onLogout
}) => {
  const menuItems = [
    { id: 'dashboard' as ModuleType, label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'students' as ModuleType, label: 'Direct Student Add/Remove', icon: Users, badge: 'Direct' },
    { id: 'fees' as ModuleType, label: 'Fee Collection & WhatsApp', icon: CreditCard, badge: 'WhatsApp' },
    { id: 'attendance' as ModuleType, label: 'Teacher & Student Attendance', icon: Clock },
    { id: 'accounts' as ModuleType, label: 'Income & Expenditure Software', icon: TrendingUp },
  ];

  return (
    <aside style={{
      width: '280px',
      background: 'rgba(36, 4, 44, 0.95)',
      backdropFilter: 'blur(16px)',
      borderRight: '1px solid rgba(212, 175, 55, 0.25)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      flexShrink: 0,
      padding: '24px 16px',
      boxShadow: '4px 0 25px rgba(0, 0, 0, 0.3)'
    }}>
      {/* Brand Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        paddingBottom: '20px',
        marginBottom: '20px',
        borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
      }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: 'var(--bg-purple-main)',
          border: '2px solid var(--gold-primary)',
          padding: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          flexShrink: 0
        }}>
          <img src={logoImg} alt="Essani Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div>
          <h2 className="gold-heading" style={{ fontSize: '1rem', margin: 0, lineHeight: 1.2 }}>
            ESSANI ACADEMY
          </h2>
          <div style={{ fontSize: '0.75rem', color: '#D4AF37', fontWeight: 600, marginTop: '2px' }}>
            Nur to Matric
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          color: 'rgba(212, 175, 55, 0.7)',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          padding: '0 12px 8px 12px'
        }}>
          School Management
        </div>

        {menuItems.map((item) => {
          const IconComp = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: isActive ? '1px solid var(--gold-primary)' : '1px solid transparent',
                background: isActive 
                  ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(59, 10, 69, 0.6) 100%)' 
                  : 'transparent',
                color: isActive ? 'var(--gold-bright)' : '#E5E7EB',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <IconComp size={18} color={isActive ? '#FFD700' : '#D4AF37'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  background: isActive ? 'var(--gold-gradient)' : 'rgba(212, 175, 55, 0.15)',
                  color: isActive ? '#24042C' : '#D4AF37',
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Owner Profile Footer */}
      <div style={{
        paddingTop: '16px',
        marginTop: '16px',
        borderTop: '1px solid rgba(212, 175, 55, 0.2)'
      }}>
        <div style={{
          background: 'rgba(59, 10, 69, 0.6)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          borderRadius: '12px',
          padding: '12px',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <ShieldCheck size={20} color="#FFD700" />
          <div style={{ fontSize: '0.8rem', overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.name || 'Muhammad Arsalan Qasim'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#D4AF37' }}>
              Administrator
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '10px',
            borderRadius: '10px',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#FCA5A5',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
};
