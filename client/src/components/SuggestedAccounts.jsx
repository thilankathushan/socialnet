import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import api from '../api';

const CATEGORIES = [
  { id: 'tech',    label: 'Tech News',    emoji: '💻' },
  { id: 'sports',  label: 'Sports',       emoji: '⚽' },
  { id: 'science', label: 'Science',      emoji: '🔬' },
  { id: 'world',   label: 'World News',   emoji: '🌍' },
];

export default function SuggestedAccounts({ onFollow }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  async function loadSuggestions() {
    try {
      const res = await api.get('/users/suggestions');
      setSuggestions(res.data.users);
    } catch {
      // Fallback to static suggestions if API fails
      setSuggestions(CATEGORIES.map(cat => ({
        id: cat.id,
        username: cat.id + '_news',
        bio: cat.label,
        avatar_url: '',
        emoji: cat.emoji,
        is_following: false,
        isStatic: true
      })));
    } finally {
      setLoading(false);
    }
  }

  async function handleFollow(username) {
    try {
      await api.post(`/users/${username}/follow`);
      setSuggestions(prev =>
        prev.map(u => u.username === username
          ? { ...u, is_following: true }
          : u
        )
      );
      onFollow?.();
    } catch (err) {
      console.error('Follow error:', err);
    }
  }

  if (loading) return null;
  if (suggestions.length === 0) return null;

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '1rem',
      marginBottom: 16,
      boxShadow: 'var(--shadow)'
    }}>
      <p style={{
        fontSize: 13, fontWeight: 600,
        color: 'var(--text2)', marginBottom: 12,
        textTransform: 'uppercase', letterSpacing: '0.05em'
      }}>
        Suggested accounts
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {suggestions.slice(0, 5).map(user => (
          <div key={user.username} style={{
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <Link to={`/profile/${user.username}`}>
              <Avatar src={user.avatar_url} username={user.username} size={38} />
            </Link>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Link to={`/profile/${user.username}`}>
                <p style={{
                  fontSize: 13, fontWeight: 600,
                  color: 'var(--text)',
                  whiteSpace: 'nowrap', overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {user.username}
                </p>
              </Link>
              {user.bio && (
                <p style={{
                  fontSize: 12, color: 'var(--text2)',
                  whiteSpace: 'nowrap', overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {user.bio}
                </p>
              )}
            </div>
            {!user.is_following && (
              <button
                onClick={() => handleFollow(user.username)}
                style={{
                  background: 'var(--accent)', color: '#fff',
                  border: 'none', borderRadius: 20,
                  padding: '4px 14px', fontSize: 12,
                  fontWeight: 600, flexShrink: 0,
                  cursor: 'pointer'
                }}
              >
                Follow
              </button>
            )}
            {user.is_following && (
              <span style={{
                fontSize: 12, color: 'var(--text2)',
                padding: '4px 10px'
              }}>
                Following ✓
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}