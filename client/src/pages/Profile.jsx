import { useState, useEffect } from 'react';
import { useParams }  from 'react-router-dom';
import { useAuth }    from '../context/AuthContext';
import Avatar         from '../components/Avatar';
import PostCard       from '../components/PostCard';
import PostForm       from '../components/PostForm';
import api            from '../api';

export default function Profile() {
  const { username }   = useParams();
  const { user: authUser, updateUser } = useAuth();
  const [profile,   setProfile]   = useState(null);
  const [posts,     setPosts]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [following, setFollowing] = useState(false);
  const [editMode,  setEditMode]  = useState(false);
  const [bio,       setBio]       = useState('');
  const [avatar,    setAvatar]    = useState(null);
  const [isMobile,  setIsMobile]  = useState(window.innerWidth < 768);

  const isMe = authUser?.username === username;

  useEffect(() => {
    function handleResize() { setIsMobile(window.innerWidth < 768); }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { loadProfile(); }, [username]);

  async function loadProfile() {
    setLoading(true);
    try {
      const res = await api.get(`/users/${username}`);
      setProfile(res.data.user);
      setPosts(res.data.posts);
      setFollowing(res.data.user.is_following);
      setBio(res.data.user.bio || '');
    } catch (err) {
      console.error('Profile error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleFollow() {
    try {
      const res = await api.post(`/users/${username}/follow`);
      setFollowing(res.data.following);
      setProfile(prev => ({
        ...prev,
        followers_count: res.data.following
          ? prev.followers_count + 1
          : prev.followers_count - 1
      }));
    } catch (err) {
      console.error('Follow error:', err);
    }
  }

  async function handleSaveProfile() {
    try {
      const formData = new FormData();
      formData.append('bio', bio);
      if (avatar) formData.append('avatar', avatar);
      const res = await api.patch('/users/me/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser(res.data.user);
      setProfile(prev => ({ ...prev, ...res.data.user }));
      setEditMode(false);
      setAvatar(null);
    } catch (err) {
      console.error('Update profile error:', err);
    }
  }

  function handleNewPost(post) { setPosts(prev => [post, ...prev]); }
  function handleDelete(postId) { setPosts(prev => prev.filter(p => p.id !== postId)); }

  if (loading) return (
    <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text2)' }}>
      Loading...
    </p>
  );

  if (!profile) return (
    <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text2)' }}>
      User not found
    </p>
  );

  return (
    <div style={{
      maxWidth: 680, margin: '0 auto',
      padding: isMobile ? '0.75rem' : '1rem'
    }}>

      {/* Profile header */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: isMobile ? '1rem' : '1.5rem',
        marginBottom: '1rem',
        boxShadow: 'var(--shadow)'
      }}>

        {/* Top row — avatar + actions */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 12,
          gap: 12
        }}>
          <Avatar
            src={profile.avatar_url}
            username={profile.username}
            size={isMobile ? 64 : 80}
          />

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {isMe ? (
              <button
                onClick={() => setEditMode(!editMode)}
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 20,
                  padding: isMobile ? '5px 12px' : '5px 16px',
                  fontSize: isMobile ? 12 : 13,
                  fontWeight: 500, cursor: 'pointer',
                  color: 'var(--text)'
                }}
              >
                {editMode ? 'Cancel' : 'Edit profile'}
              </button>
            ) : (
              <button
                onClick={handleFollow}
                style={{
                  background: following ? 'var(--surface2)' : 'var(--accent)',
                  color: following ? 'var(--text)' : '#fff',
                  border: `1px solid ${following ? 'var(--border)' : 'var(--accent)'}`,
                  borderRadius: 20,
                  padding: isMobile ? '5px 14px' : '6px 20px',
                  fontSize: isMobile ? 12 : 13,
                  fontWeight: 500, cursor: 'pointer'
                }}
              >
                {following ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        {/* Username and bio */}
        <div style={{ marginBottom: 12 }}>
          <h1 style={{
            fontSize: isMobile ? '1.1rem' : '1.2rem',
            fontWeight: 700, marginBottom: 4
          }}>
            {profile.username}
          </h1>
          {!editMode && (
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.5 }}>
              {profile.bio || 'No bio yet'}
            </p>
          )}
        </div>

        {/* Edit mode */}
        {editMode && (
          <div style={{ marginBottom: 12 }}>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Write a bio..."
              maxLength={200}
              rows={3}
              style={{
                width: '100%', background: 'var(--surface2)',
                border: '1px solid var(--border)', borderRadius: 8,
                padding: '8px 10px', fontSize: 13, color: 'var(--text)',
                resize: 'none', outline: 'none', marginBottom: 8
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <label style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: 6, padding: '6px 12px',
                fontSize: 13, cursor: 'pointer', color: 'var(--text)'
              }}>
                Change avatar
                <input type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => setAvatar(e.target.files[0])} />
              </label>
              <button onClick={handleSaveProfile} style={{
                background: 'var(--accent)', color: '#fff',
                border: 'none', borderRadius: 6,
                padding: '6px 16px', fontSize: 13, fontWeight: 500,
                cursor: 'pointer'
              }}>
                Save
              </button>
            </div>
            {avatar && (
              <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>
                Selected: {avatar.name}
              </p>
            )}
          </div>
        )}

        {/* Stats */}
        <div style={{
          display: 'flex',
          gap: isMobile ? 16 : 24,
          paddingTop: 12,
          borderTop: '1px solid var(--border)'
        }}>
          {[
            [posts.length, 'posts'],
            [profile.followers_count, 'followers'],
            [profile.following_count, 'following']
          ].map(([count, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 700, fontSize: isMobile ? 16 : 18 }}>
                {count}
              </p>
              <p style={{ fontSize: isMobile ? 11 : 12, color: 'var(--text2)' }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Post form — own profile only */}
      {isMe && <PostForm onPost={handleNewPost} />}

      {/* Posts */}
      {posts.length === 0 ? (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '2rem', textAlign: 'center',
          boxShadow: 'var(--shadow)'
        }}>
          <p style={{ color: 'var(--text2)' }}>No posts yet</p>
        </div>
      ) : (
        posts.map(post => (
          <PostCard key={post.id} post={post} onDelete={handleDelete} />
        ))
      )}
    </div>
  );
}