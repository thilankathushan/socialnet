import { useState, useEffect } from 'react';
import { useParams }  from 'react-router-dom';
import { useAuth }    from '../context/AuthContext';
import Avatar         from '../components/Avatar';
import PostCard       from '../components/PostCard';
import PostForm       from '../components/PostForm';
import api            from '../api';

export default function Profile() {
  const { username }        = useParams();
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [editMode,  setEditMode]  = useState(false);
  const [bio,       setBio]       = useState('');
  const [avatar,    setAvatar]    = useState(null);

  const isMe = authUser?.username === username;

  useEffect(() => {
    loadProfile();
  }, [username]);

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

  function handleNewPost(post) {
    setPosts(prev => [post, ...prev]);
  }

  function handleDelete(postId) {
    setPosts(prev => prev.filter(p => p.id !== postId));
  }

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
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem' }}>

      {/* Profile header */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <Avatar src={profile.avatar_url} username={profile.username} size={72} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  {profile.username}
                </h1>
                {!editMode && (
                  <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>
                    {profile.bio || 'No bio yet'}
                  </p>
                )}
              </div>
              {isMe ? (
                <button
                  onClick={() => setEditMode(!editMode)}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 20, padding: '5px 14px',
                    fontSize: 13, fontWeight: 500
                  }}
                >
                  {editMode ? 'Cancel' : 'Edit profile'}
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  style={{
                    background: following ? 'var(--surface)' : 'var(--accent)',
                    color: following ? 'var(--text)' : '#fff',
                    border: `1px solid ${following ? 'var(--border)' : 'var(--accent)'}`,
                    borderRadius: 20, padding: '5px 18px',
                    fontSize: 13, fontWeight: 500
                  }}
                >
                  {following ? 'Following' : 'Follow'}
                </button>
              )}
            </div>

            {editMode && (
              <div style={{ marginTop: 10 }}>
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
                    borderRadius: 6, padding: '5px 12px',
                    fontSize: 13, cursor: 'pointer'
                  }}>
                    Change avatar
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => setAvatar(e.target.files[0])} />
                  </label>
                  <button onClick={handleSaveProfile} style={{
                    background: 'var(--accent)', color: '#fff',
                    border: 'none', borderRadius: 6,
                    padding: '5px 16px', fontSize: 13, fontWeight: 500
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

            <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: 15 }}>
                  {posts.length}
                </span>
                <span style={{ color: 'var(--text2)', fontSize: 13, marginLeft: 4 }}>
                  posts
                </span>
              </div>
              <div>
                <span style={{ fontWeight: 600, fontSize: 15 }}>
                  {profile.followers_count}
                </span>
                <span style={{ color: 'var(--text2)', fontSize: 13, marginLeft: 4 }}>
                  followers
                </span>
              </div>
              <div>
                <span style={{ fontWeight: 600, fontSize: 15 }}>
                  {profile.following_count}
                </span>
                <span style={{ color: 'var(--text2)', fontSize: 13, marginLeft: 4 }}>
                  following
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isMe && <PostForm onPost={handleNewPost} />}

      {posts.length === 0 ? (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '2rem', textAlign: 'center'
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