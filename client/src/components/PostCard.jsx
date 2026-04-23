import { useState } from 'react';
import { Link }     from 'react-router-dom';
import { useAuth }  from '../context/AuthContext';
import Avatar       from './Avatar';
import api          from '../api';

const SERVER = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)    return `${diff}s`;
  if (diff < 3600)  return `${Math.floor(diff/60)}m`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PostCard({ post, onDelete }) {
  const { user }             = useAuth();
  const [liked,  setLiked]   = useState(post.liked_by_me);
  const [likes,  setLikes]   = useState(post.like_count);
  const [loading,setLoading] = useState(false);
  const isOwner = user?.id === post.user_id;

  async function handleLike() {
    if (loading) return;
    setLoading(true);
    const wasLiked = liked;
    setLiked(!liked);
    setLikes(prev => liked ? prev - 1 : prev + 1);
    try {
      await api.post(`/posts/${post.id}/like`);
    } catch {
      setLiked(wasLiked);
      setLikes(prev => wasLiked ? prev + 1 : prev - 1);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${post.id}`);
      onDelete?.(post.id);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      marginBottom: 12,
      overflow: 'hidden',
      boxShadow: 'var(--shadow)',
      transition: 'box-shadow 0.15s'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px'
      }}>
        <Link to={`/profile/${post.username}`} style={{
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <Avatar src={post.avatar_url} username={post.username} size={42} />
          <div>
            <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
              {post.username}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text2)' }}>
              {timeAgo(post.created_at)} ago
            </p>
          </div>
        </Link>
        {isOwner && (
          <button onClick={handleDelete} style={{
            background: 'none', border: 'none',
            color: 'var(--text2)', fontSize: 18,
            width: 32, height: 32, borderRadius: '50%',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#fff0f0'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            ×
          </button>
        )}
      </div>

      {/* Content */}
      {post.content && (
        <p style={{
          fontSize: 15, lineHeight: 1.6,
          padding: '0 16px 12px',
          color: 'var(--text)',
          whiteSpace: 'pre-wrap', wordBreak: 'break-word'
        }}>
          {post.content}
        </p>
      )}

      {/* Image */}
      {post.image_url && (
        <img
          src={post.image_url.startsWith('http')
            ? post.image_url : `${SERVER}${post.image_url}`}
          alt="Post"
          style={{
            width: '100%', maxHeight: 500,
            objectFit: 'cover'
          }}
        />
      )}

      {/* Footer */}
      <div style={{
        padding: '8px 16px 12px',
        borderTop: post.image_url ? '1px solid var(--border)' : 'none',
        display: 'flex', gap: 16, alignItems: 'center'
      }}>
        <button onClick={handleLike} style={{
          background: 'none', border: 'none',
          display: 'flex', alignItems: 'center', gap: 6,
          color: liked ? 'var(--danger)' : 'var(--text2)',
          fontSize: 14, padding: '6px 10px',
          borderRadius: 8, transition: 'all 0.15s'
        }}
          onMouseEnter={e => e.currentTarget.style.background = liked ? '#fff0f0' : 'var(--surface2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>
            {liked ? '❤️' : '🤍'}
          </span>
          <span style={{ fontWeight: liked ? 600 : 400 }}>
            {likes} {likes === 1 ? 'like' : 'likes'}
          </span>
        </button>
      </div>
    </div>
  );
}