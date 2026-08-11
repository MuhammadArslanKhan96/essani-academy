import React, { useState } from 'react';
import logoImg from '../assets/school_logo.png';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginCardProps {
  onLoginSuccess: (userData: any) => void;
}

export const LoginCard: React.FC<LoginCardProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('arsalan.qasim@essani.edu.pk');
  const [password, setPassword] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.message || 'Invalid credentials. Password is "admin"');
      }
    } catch (err) {
      if (password === 'admin') {
        onLoginSuccess({
          name: 'Muhammad Arsalan Qasim',
          title: 'Administrator & Owner',
          email: 'arsalan.qasim@essani.edu.pk',
          phone: '0332 2454401',
          school: 'Essani Children Academy',
          level: 'Nur to Matric'
        });
      } else {
        setError('Network error connecting to backend service.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{
      maxWidth: '440px',
      width: '100%',
      margin: '40px auto',
      padding: '0 16px'
    }}>
      {/* Sleek White Card */}
      <div className="white-card" style={{ padding: '40px 32px' }}>
        
        {/* Calligraphic Logo Emblem */}
        <div className="logo-frame" style={{ marginBottom: '20px' }}>
          <img src={logoImg} alt="Essani Children Academy" />
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 className="gold-heading" style={{ fontSize: '1.35rem', marginBottom: '6px', color: 'var(--bg-purple-main)' }}>
            ESSANI CHILDREN ACADEMY
          </h2>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(59, 10, 69, 0.06)',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            color: 'var(--bg-purple-main)',
            fontWeight: 600
          }}>
            <ShieldCheck size={14} color="#D4AF37" /> Nur to Matric Portal
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: '#FFF5F5',
            border: '1px solid #FEB2B2',
            color: '#C53030',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="custom-input-group">
            <label className="custom-input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} color="#D4AF37" /> Email / ID
            </label>
            <input
              type="text"
              className="custom-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="arsalan.qasim@essani.edu.pk"
              required
            />
          </div>

          <div className="custom-input-group" style={{ marginBottom: '28px' }}>
            <label className="custom-input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} color="#D4AF37" /> Password
            </label>
            <input
              type="password"
              className="custom-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            className="gold-button"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'AUTHENTICATING...' : (
              <>
                LOG IN TO PORTAL <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div style={{
          marginTop: '28px',
          paddingTop: '16px',
          borderTop: '1px solid #EDF2F7',
          textAlign: 'center',
          fontSize: '0.78rem',
          color: '#718096'
        }}>
          Muhammad Arsalan Qasim (Administrator) • 0332 2454401
        </div>

      </div>
    </div>
  );
};
