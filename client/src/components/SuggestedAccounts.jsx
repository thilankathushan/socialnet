import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import api from '../api';

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
      setSuggestions([]);
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

  if (loading) return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '1rem',
      boxShadow: 'var(--shadow)'
    }}>
      <p style={{ fontSize: 13, color: 'var(--text2)' }}>Loading suggestions...</p>
    </div>
  );

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '1rem',
      boxShadow: 'var(--shadow)'
    }}>
      <p style={{
        fontSize: 12, fontWeight: 600,
        color: 'var(--text2)', marginBottom: 12,
        textTransform: 'uppercase', letterSpacing: '0.05em'
      }}>
        {suggestions.length > 0 ? 'Suggested for you' : 'Who to follow'}
      </p>

      {suggestions.length === 0 ? (
        <div>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10 }}>
            You're following everyone! Check out the Explore page to find more people.
          </p>
          <Link to="/explore" style={{
            fontSize: 13, color: 'var(--accent)', fontWeight: 500
          }}>
            Go to Explore →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {suggestions.map(user => (
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
                <p style={{ fontSize: 11, color: 'var(--text2)' }}>
                  {user.followers_count} follower{user.followers_count !== 1 ? 's' : ''}
                </p>
              </div>
              {!user.is_following ? (
                <button
                  onClick={() => handleFollow(user.username)}
                  style={{
                    background: 'var(--accent)', color: '#fff',
                    border: 'none', borderRadius: 20,
                    padding: '5px 14px', fontSize: 12,
                    fontWeight: 600, flexShrink: 0, cursor: 'pointer'
                  }}
                >
                  Follow
                </button>
              ) : (
                <span style={{
                  fontSize: 12, color: 'var(--success)',
                  padding: '4px 8px', flexShrink: 0
                }}>
                  ✓ Following
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <Link to="/explore" style={{
          display: 'block', marginTop: 12,
          fontSize: 12, color: 'var(--accent)',
          fontWeight: 500
        }}>
          See more →
        </Link>
      )}
    </div>
  );
}