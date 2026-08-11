import React from 'react';
import logoImg from '../assets/school_logo.png';
import { Phone, MapPin, GraduationCap, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  user?: any;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header style={{
      background: 'rgba(42, 6, 51, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
      padding: '16px 32px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Left Side: Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'var(--bg-purple-main)',
            border: '2px solid var(--gold-primary)',
            padding: '4px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
          }}>
            <img src={logoImg} alt="Essani Academy Emblem" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <h1 className="gold-heading" style={{ fontSize: '1.25rem', margin: 0, lineHeight: 1.2 }}>
              ESSANI CHILDREN ACADEMY
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
              <span className="gold-badge">Nur to Matric</span>
              <span style={{ fontSize: '0.85rem', color: '#D1D5DB', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} color="#D4AF37" /> Garden West, Karachi
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Owner / Contact / User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {!user ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.85rem', color: '#E5E7EB' }}>
              <div style={{ fontWeight: 600, color: 'var(--gold-bright)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} /> Muhammad Arsalan Qasim (Administrator)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9CA3AF', marginTop: '2px' }}>
                <Phone size={13} color="#D4AF37" /> 0332 2454401
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, color: 'var(--gold-bright)' }}>{user.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>{user.title}</div>
              </div>
              <button 
                onClick={onLogout}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--gold-primary)',
                  color: 'var(--gold-bright)',
                  padding: '6px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
