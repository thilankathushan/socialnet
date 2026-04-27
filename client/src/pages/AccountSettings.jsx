import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function AccountSettings() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [username,    setUsername]    = useState(user?.username || '');
  const [email,       setEmail]       = useState(user?.email    || '');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass,     setNewPass]     = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [msg,         setMsg]         = useState({ text: '', type: '' });
  const [loading,     setLoading]     = useState(false);

  function showMsg(text, type = 'success') {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.patch('/users/me/account', { username, email });
      updateUser(res.data.user);
      showMsg('Profile updated successfully');
    } catch (err) {
      showMsg(err.response?.data?.error || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (newPass !== confirmPass) {
      showMsg('New passwords do not match', 'error');
      return;
    }
    if (newPass.length < 8) {
      showMsg('Password must be at least 8 characters', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.patch('/users/me/password', {
        currentPassword: currentPass,
        newPassword: newPass
      });
      showMsg('Password changed successfully');
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
    } catch (err) {
      showMsg(err.response?.data?.error || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm('Are you sure? This will permanently delete your account and all your posts.')) return;
    try {
      await api.delete('/users/me');
      logout();
      navigate('/register');
    } catch (err) {
      showMsg('Failed to delete account', 'error');
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 8, padding: '10px 14px',
    fontSize: 14, color: 'var(--text)',
    outline: 'none', marginBottom: 12
  };

  const sectionStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '1.5rem',
    marginBottom: 16,
    boxShadow: 'var(--shadow)'
  };

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '1.5rem 1rem' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem' }}>
        Account Settings
      </h1>

      {msg.text && (
        <div style={{
          padding: '10px 14px', borderRadius: 8, marginBottom: 16,
          background: msg.type === 'error' ? '#fff0f0' : '#f0fff8',
          color: msg.type === 'error' ? 'var(--danger)' : 'var(--success)',
          border: `1px solid ${msg.type === 'error' ? 'var(--danger)' : 'var(--success)'}`,
          fontSize: 14
        }}>
          {msg.text}
        </div>
      )}

      {/* Profile info */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
          Profile information
        </h2>
        <form onSubmit={handleUpdateProfile}>
          <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>
            Username
          </label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={inputStyle} required
          />
          <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>
            Email
          </label>
          <input
            type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle} required
          />
          <button type="submit" disabled={loading} style={{
            background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: 8,
            padding: '8px 20px', fontSize: 14, fontWeight: 500
          }}>
            {loading ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
          Change password
        </h2>
        <form onSubmit={handleChangePassword}>
          <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>
            Current password
          </label>
          <input
            type="password" value={currentPass}
            onChange={e => setCurrentPass(e.target.value)}
            style={inputStyle} required
          />
          <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>
            New password
          </label>
          <input
            type="password" value={newPass}
            onChange={e => setNewPass(e.target.value)}
            style={inputStyle} required
          />
          <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>
            Confirm new password
          </label>
          <input
            type="password" value={confirmPass}
            onChange={e => setConfirmPass(e.target.value)}
            style={inputStyle} required
          />
          <button type="submit" disabled={loading} style={{
            background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: 8,
            padding: '8px 20px', fontSize: 14, fontWeight: 500
          }}>
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div style={{ ...sectionStyle, border: '1px solid var(--danger)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--danger)', marginBottom: 8 }}>
          Danger zone
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>
          Permanently delete your account and all your posts. This cannot be undone.
        </p>
        <button onClick={handleDeleteAccount} style={{
          background: 'var(--danger)', color: '#fff',
          border: 'none', borderRadius: 8,
          padding: '8px 20px', fontSize: 14, fontWeight: 500
        }}>
          Delete my account
        </button>
      </div>
    </div>
  );
}