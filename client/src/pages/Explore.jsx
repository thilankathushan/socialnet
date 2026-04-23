import { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import api      from '../api';

export default function Explore() {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => { loadExplore(1); }, []);

  async function loadExplore(pageNum) {
    try {
      const res = await api.get(`/users/explore?page=${pageNum}`);
      if (pageNum === 1) {
        setPosts(res.data.posts);
      } else {
        setPosts(prev => [...prev, ...res.data.posts]);
      }
      setHasMore(res.data.hasMore);
      setPage(pageNum);
    } catch (err) {
      console.error('Explore error:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleDelete(postId) {
    setPosts(prev => prev.filter(p => p.id !== postId));
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '1.5rem 1rem' }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>
        Explore
      </h2>
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text2)', padding: '2rem' }}>
          Loading...
        </p>
      ) : (
        <>
          {posts.map(post => (
            <PostCard key={post.id} post={post} onDelete={handleDelete} />
          ))}
          {hasMore && (
            <button
              onClick={() => loadExplore(page + 1)}
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