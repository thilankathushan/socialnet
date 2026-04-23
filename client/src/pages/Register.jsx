import { useState }    from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth }     from '../context/AuthContext';

export default function Register() {
  const { register }  = useAuth();
  const navigate      = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form.username, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%', background: '#f7f6f3',
    border: '1px solid var(--border)', borderRadius: 8,
    padding: '0.75rem 1rem', fontSize: 14,
    color: 'var(--text)', outline: 'none', marginBottom: 12
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 380
      }}>
        <h1 style={{
          fontSize: '1.4rem', fontWeight: 700,
          color: 'var(--accent)', marginBottom: 4
        }}>
          SocialNet
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: '1.5rem' }}>
          Create your account
        </p>

        <form onSubmit={handleSubmit}>
          <input
            value={form.username}
            onChange={e => setForm({...form, username: e.target.value})}
            placeholder="Username"
            required style={inputStyle}
          />
          <input
            type="email" value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
            placeholder="Email" required style={inputStyle}
          />
          <input
            type="password" value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
            placeholder="Password (min 8 characters)"
            required style={inputStyle}
          />
          {error && (
            <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 10 }}>
              {error}
            </p>
          )}
          <button type="submit" disabled={loading} style={{
            width: '100%', background: 'var(--accent)',
            color: '#fff', border: 'none', borderRadius: 8,
            padding: '0.75rem', fontSize: 15, fontWeight: 600
          }}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text2)', marginTop: 16 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}