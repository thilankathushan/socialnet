import { useState, useRef } from 'react';
import { useAuth }  from '../context/AuthContext';
import Avatar       from './Avatar';
import api          from '../api';

export default function PostForm({ onPost }) {
  const { user }              = useAuth();
  const [content, setContent] = useState('');
  const [image,   setImage]   = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [focused, setFocused] = useState(false);
  const fileRef = useRef(null);

  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim() && !image) return;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      if (image) formData.append('image', image);
      const res = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onPost(res.data.post);
      setContent(''); setImage(null); setPreview(''); setFocused(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '16px',
      marginBottom: 16,
      boxShadow: 'var(--shadow)'
    }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <Avatar src={user?.avatar_url} username={user?.username} size={42} />
        <div style={{ flex: 1 }}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder={`What's on your mind, ${user?.username}?`}
            maxLength={500}
            rows={focused ? 4 : 2}
            style={{
              width: '100%', background: 'var(--surface2)',
              border: '1.5px solid ' + (focused ? 'var(--accent)' : 'var(--border)'),
              borderRadius: 10, padding: '10px 14px',
              fontSize: 15, color: 'var(--text)',
              resize: 'none', outline: 'none',
              transition: 'all 0.2s', lineHeight: 1.5
            }}
          />

          {preview && (
            <div style={{ position: 'relative', marginTop: 8 }}>
              <img src={preview} alt="Preview" style={{
                width: '100%', maxHeight: 280,
                objectFit: 'cover', borderRadius: 8
              }}/>
              <button onClick={() => { setImage(null); setPreview(''); }} style={{
                position: 'absolute', top: 8, right: 8,
                background: 'rgba(0,0,0,0.55)', color: '#fff',
                border: 'none', borderRadius: '50%',
                width: 30, height: 30, fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>×</button>
            </div>
          )}

          {error && (
            <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 6 }}>{error}</p>
          )}

          {(focused || content || image) && (
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginTop: 10,
              paddingTop: 10, borderTop: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => fileRef.current?.click()} style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 8, padding: '6px 12px',
                  fontSize: 13, color: 'var(--text2)',
                  display: 'flex', alignItems: 'center', gap: 4,
                  transition: 'all 0.15s'
                }}>
                  📷 Photo
                </button>
                <input ref={fileRef} type="file" accept="image/*"
                  onChange={handleImage} style={{ display: 'none' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontSize: 12,
                  color: (500 - content.length) < 50 ? 'var(--danger)' : 'var(--text2)'
                }}>
                  {500 - content.length}
                </span>
                <button onClick={handleSubmit}
                  disabled={(!content.trim() && !image) || loading}
                  style={{
                    background: (!content.trim() && !image) || loading
                      ? 'var(--border)' : 'var(--accent)',
                    color: (!content.trim() && !image) || loading ? 'var(--text2)' : '#fff',
                    border: 'none', borderRadius: 20,
                    padding: '8px 22px', fontSize: 14, fontWeight: 600,
                    transition: 'all 0.15s'
                  }}
                >
                  {loading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}