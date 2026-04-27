import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>
          SocialNet
        </h1>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <p style={{ fontSize: '2rem', marginBottom: 12 }}>📬</p>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Check your email</p>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 16 }}>
              If an account with that email exists, we sent a reset link. Check your inbox and spam folder.
            </p>
            <Link to="/login" style={{ color: 'var(--accent)', fontSize: 14, fontWeight: 500 }}>
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: '1.5rem' }}>
              Enter your email and we'll send you a reset link.
            </p>
            <form onSubmit={handleSubmit}>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                required style={inputStyle}
              />
              {error && (
                <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 10 }}>{error}</p>
              )}
              <button type="submit" disabled={loading} style={{
                width: '100%', background: 'var(--accent)',
                color: '#fff', border: 'none', borderRadius: 8,
                padding: '10px', fontSize: 15, fontWeight: 600,
                marginBottom: 12, cursor: 'pointer'
              }}>
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text2)' }}>
              Remember your password?{' '}
              <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>Log in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}