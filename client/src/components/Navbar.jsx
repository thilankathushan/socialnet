import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Avatar from './Avatar';
import api from '../api';

export default function Navbar() {
  const { user, logout }       = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate               = useNavigate();
  const location               = useLocation();
  const [query,   setQuery]    = useState('');
  const [results, setResults]  = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSearch(e) {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim()) { setResults([]); return; }
    try {
      const res = await api.get(`/users/search?q=${val}`);
      setResults(res.data.users);
    } catch { setResults([]); }
  }

  function handleLogout() { logout(); navigate('/login'); }
  const isActive = path => location.pathname === path;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      boxShadow: 'var(--shadow)'
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        display: 'flex', alignItems: 'center',
        gap: 12, height: 56, padding: '0 1rem'
      }}>

        {/* Logo */}
        <Link to="/" style={{
          fontWeight: 800, fontSize: '1.2rem',
          color: 'var(--accent)', flexShrink: 0,
          letterSpacing: '-0.5px'
        }}>
          🌐 SocialNet
        </Link>

        {user && (
          <>
            {/* Search — hidden on mobile */}
            <div style={{
              position: 'relative', flex: 1, maxWidth: 360,
              display: window.innerWidth < 768 ? 'none' : 'block'
            }}>
              <input
                value={query}
                onChange={handleSearch}
                onBlur={() => setTimeout(() => setResults([]), 200)}
                placeholder="Search people..."
                style={{
                  width: '100%', background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 20, padding: '8px 16px 8px 36px',
                  fontSize: 14, color: 'var(--text)', outline: 'none'
                }}
              />
              <span style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 14, color: 'var(--text2)'
              }}>🔍</span>

              {results.length > 0 && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 4px)',
                  left: 0, right: 0,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  overflow: 'hidden', zIndex: 200
                }}>
                  {results.map(u => (
                    <Link
                      key={u.id}
                      to={`/profile/${u.username}`}
                      onClick={() => { setQuery(''); setResults([]); }}
                      style={{
                        display: 'flex', alignItems: 'center',
                        gap: 10, padding: '10px 14px',
                        borderBottom: '1px solid var(--border)'
                      }}
                    >
                      <Avatar src={u.avatar_url} username={u.username} size={36} />
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600 }}>{u.username}</p>
                        {u.bio && (
                          <p style={{ fontSize: 12, color: 'var(--text2)' }}>
                            {u.bio.slice(0, 40)}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop nav links */}
            <div style={{
              display: window.innerWidth < 768 ? 'none' : 'flex',
              gap: 4, alignItems: 'center', marginLeft: 'auto'
            }}>
              {[['/', 'Feed'], ['/explore', 'Explore'], ['/settings', 'Settings']].map(([path, label]) => (
                <Link key={path} to={path} style={{
                  fontSize: 14, fontWeight: isActive(path) ? 600 : 400,
                  color: isActive(path) ? 'var(--accent)' : 'var(--text2)',
                  padding: '6px 12px', borderRadius: 8,
                  background: isActive(path) ? 'var(--accent-light)' : 'transparent',
                  transition: 'all 0.15s'
                }}>
                  {label}
                </Link>
              ))}

              <Link to={`/profile/${user.username}`} style={{
                display: 'flex', alignItems: 'center',
                gap: 8, padding: '4px 10px',
                borderRadius: 20,
                border: '1px solid var(--border)',
                marginLeft: 4
              }}>
                <Avatar src={user.avatar_url} username={user.username} size={28} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{user.username}</span>
              </Link>

              <button onClick={toggleTheme} style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: 20, padding: '5px 12px',
                fontSize: 14, cursor: 'pointer',
                color: 'var(--text2)'
              }}>
                {theme === 'light' ? '🌙' : '☀️'}
              </button>

              <button onClick={handleLogout} style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: 8, color: 'var(--text2)',
                fontSize: 13, padding: '6px 12px', cursor: 'pointer'
              }}>
                Log out
              </button>
            </div>

            {/* Mobile right side */}
            <div style={{
              display: window.innerWidth >= 768 ? 'none' : 'flex',
              alignItems: 'center', gap: 8, marginLeft: 'auto'
            }}>
              <button onClick={toggleTheme} style={{
                background: 'none', border: 'none',
                fontSize: 18, cursor: 'pointer'
              }}>
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  background: 'none', border: 'none',
                  fontSize: 22, cursor: 'pointer',
                  color: 'var(--text)', lineHeight: 1
                }}
              >
                {menuOpen ? '✕' : '☰'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {user && menuOpen && (
        <div style={{
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          padding: '0.75rem 1rem',
          display: 'flex', flexDirection: 'column', gap: 4
        }}>
          {/* Mobile search */}
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <input
              value={query}
              onChange={handleSearch}
              onBlur={() => setTimeout(() => setResults([]), 200)}
              placeholder="Search people..."
              style={{
                width: '100%', background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: 20, padding: '8px 16px 8px 36px',
                fontSize: 14, color: 'var(--text)', outline: 'none'
              }}
            />
            <span style={{
              position: 'absolute', left: 12, top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 14, color: 'var(--text2)'
            }}>🔍</span>
            {results.length > 0 && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)',
                left: 0, right: 0,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 10, overflow: 'hidden', zIndex: 200
              }}>
                {results.map(u => (
                  <Link
                    key={u.id}
                    to={`/profile/${u.username}`}
                    onClick={() => { setQuery(''); setResults([]); setMenuOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center',
                      gap: 10, padding: '10px 14px',
                      borderBottom: '1px solid var(--border)'
                    }}
                  >
                    <Avatar src={u.avatar_url} username={u.username} size={32} />
                    <p style={{ fontSize: 14, fontWeight: 600 }}>{u.username}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Mobile nav links */}
          {[['/', 'Feed'], ['/explore', 'Explore'], ['/settings', 'Settings'], [`/profile/${user.username}`, 'My Profile']].map(([path, label]) => (
            <Link
              key={path} to={path}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '10px 12px', borderRadius: 8,
                fontSize: 15, fontWeight: isActive(path) ? 600 : 400,
                color: isActive(path) ? 'var(--accent)' : 'var(--text)',
                background: isActive(path) ? 'var(--accent-light)' : 'transparent'
              }}
            >
              {label}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            style={{
              background: 'none', border: '1px solid var(--border)',
              borderRadius: 8, color: 'var(--danger)',
              fontSize: 14, padding: '10px 12px',
              textAlign: 'left', cursor: 'pointer', marginTop: 4
            }}
          >
            Log out
          </button>
        </div>
      )}
    </nav>
  );
}