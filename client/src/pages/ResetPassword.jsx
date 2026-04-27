import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function ResetPassword() {
  const [searchParams]        = useSearchParams();
  const navigate              = useNavigate();
  const token                 = searchParams.get('token');
  const [password,  setPass]  = useState('');
  const [confirm,   setConf]  = useState('');
  const [loading,   setLoad]  = useState(false);
  const [error,     setError] = useState('');
  const [success,   setSucc]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 8)  { setError('Password must be at least 8 characters'); return; }

    setLoad(true); setError('');
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setSucc(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed. Link may have expired.');
    } finally {
      setLoad(false);
    }
  }

  const inputStyle = {
    width: '100%', background: 'var(--surface2)',
    border: '1px solid var(--border)', borderRadius: 8,
    padding: '10px 14px', fontSize: 14,
    color: 'var(--text)', outline: 'none', marginBottom: 12
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: 20, padding: '2.5rem 2rem',
        width: '100%', maxWidth: 400,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
      }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent)', marginBottom: 16 }}>
          Reset password
        </h1>

        {!token ? (
          <p style={{ color: 'var(--danger)', fontSize: 14 }}>
            Invalid reset link. <Link to="/forgot-password" style={{ color: 'var(--accent)' }}>Try again</Link>
          </p>
        ) : success ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', marginBottom: 8 }}>✅</p>
            <p style={{ fontWeight: 600 }}>Password reset! Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="password" value={password}
              onChange={e => setPass(e.target.value)}
              placeholder="New password" required style={inputStyle}
            />
            <input
              type="password" value={confirm}
              onChange={e => setConf(e.target.value)}
              placeholder="Confirm new password" required style={inputStyle}
            />
            {error && (
              <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 10 }}>{error}</p>
            )}
            <button type="submit" disabled={loading} style={{
              width: '100%', background: 'var(--accent)',
              color: '#fff', border: 'none', borderRadius: 8,
              padding: '10px', fontSize: 15, fontWeight: 600, cursor: 'pointer'
            }}>
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}