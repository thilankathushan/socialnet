import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

export default function BottomNav() {
  const { user }   = useAuth();
  const location   = useLocation();
  const isActive   = path => location.pathname === path;

  if (!user) return null;

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      display: 'flex', justifyContent: 'space-around',
      alignItems: 'center', height: 56,
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      {[
        { path: '/',        icon: '🏠', label: 'Feed'    },
        { path: '/explore', icon: '🔍', label: 'Explore' },
        { path: '/settings',icon: '⚙️', label: 'Settings'},
      ].map(({ path, icon, label }) => (
        <Link key={path} to={path} style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 2,
          color: isActive(path) ? 'var(--accent)' : 'var(--text2)',
          fontSize: 10, fontWeight: isActive(path) ? 600 : 400,
          padding: '6px 16px', borderRadius: 8,
          textDecoration: 'none'
        }}>
          <span style={{ fontSize: 22 }}>{icon}</span>
          {label}
        </Link>
      ))}
      <Link to={`/profile/${user.username}`} style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 2,
        color: isActive(`/profile/${user.username}`) ? 'var(--accent)' : 'var(--text2)',
        fontSize: 10, padding: '6px 16px'
      }}>
        <Avatar src={user.avatar_url} username={user.username} size={26} />
        Profile
      </Link>
    </nav>
  );
}