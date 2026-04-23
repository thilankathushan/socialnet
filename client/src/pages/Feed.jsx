import { useState, useEffect } from 'react';
import PostCard  from '../components/PostCard';
import PostForm  from '../components/PostForm';
import api       from '../api';

export default function Feed() {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadFeed(1);
  }, []);

  async function loadFeed(pageNum) {
    try {
      const res = await api.get(`/users/feed?page=${pageNum}`);
      if (pageNum === 1) {
        setPosts(res.data.posts);
      } else {
        setPosts(prev => [...prev, ...res.data.posts]);
      }
      setHasMore(res.data.hasMore);
      setPage(pageNum);
    } catch (err) {
      console.error('Feed error:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleNewPost(post) {
    setPosts(prev => [post, ...prev]);
  }

  function handleDelete(postId) {
    setPosts(prev => prev.filter(p => p.id !== postId));
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '1.5rem 1rem' }}>
      <PostForm onPost={handleNewPost} />

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text2)', padding: '2rem' }}>
          Loading feed...
        </p>
      ) : posts.length === 0 ? (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '2rem', textAlign: 'center'
        }}>
          <p style={{ color: 'var(--text2)', marginBottom: 8 }}>
            Your feed is empty.
          </p>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>
            Follow some users from the Explore page to see their posts here.
          </p>
        </div>
      ) : (
        <>
          {posts.map(post => (
            <PostCard key={post.id} post={post} onDelete={handleDelete} />
          ))}
          {hasMore && (
            <button
              onClick={() => loadFeed(page + 1)}
              style={{
                width: '100%', background: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: 8,
                padding: '0.75rem', color: 'var(--accent)',
                fontSize: 14, fontWeight: 500, marginTop: 8
              }}
            >
              Load more
            </button>
          )}
        </>
      )}
    </div>
  );
}