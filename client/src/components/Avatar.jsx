const SERVER = 'http://localhost:5000';

export default function Avatar({ src, username, size = 40 }) {
  const initials = username?.charAt(0).toUpperCase() || '?';
  const colors   = ['#7F77DD','#5DCAA5','#E8B84B','#F0997B','#ED93B1'];
  let   hash     = 0;
  for (let i = 0; i < (username?.length || 0); i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const bg = colors[Math.abs(hash) % colors.length];

  if (src) {
    return (
      <img
        src={src.startsWith('http') ? src : `${SERVER}${src}`}
        alt={username}
        style={{
          width: size, height: size, borderRadius: '50%',
          objectFit: 'cover', flexShrink: 0
        }}
      />
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 600,
      fontSize: size * 0.4, flexShrink: 0
    }}>
      {initials}
    </div>
  );
}