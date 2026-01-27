// Top navigation bar for Study-Pilot
// - Shows app title on the left
// - Shows circular profile icon on the right
// - Clicking the icon opens a dropdown with Profile and Logout
// - Dropdown closes when clicking outside
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout, requireAuth, api } from '../lib/api';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState('');

  // Close dropdown when clicking outside the menu
  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Fetch current user's avatar (requires JWT). Uses /auth/me.
  useEffect(() => {
    (async () => {
      if (!requireAuth()) return;
      try {
        const me = await api('/auth/me');
        const src = me?.avatarUrl ? (me.avatarUrl.startsWith('/uploads') ? `/api${me.avatarUrl}` : me.avatarUrl) : '';
        setAvatar(src);
      } catch {}
    })();
  }, []);

  return (
    <nav className="px-3 py-4 flex items-center">
      <div className="flex-1" />
      <div className="mb-4 flex items-center gap-2">
        <img src="/favicon.svg" alt="Study-Pilot" className="h-6 w-6" />
        <span className="heading text-xl">Study-Pilot</span>
      </div>
      <div className="flex-1 flex justify-end relative" ref={ref}>
        <button className="w-9 h-9 rounded-full bg-charcoal-800 border border-white/10 overflow-hidden" onClick={() => setOpen((v) => !v)} aria-label="Profile">
          {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : null}
        </button>
        {open && (
          <div className="absolute right-0 mt-2 min-w-40 chalk-card p-2">
            {/* Profile: navigate to /profile */}
            <Link to="/profile" className="block px-3 py-2 rounded hover:bg-white/5" onClick={() => setOpen(false)}>Profile</Link>
            {/* Logout: clear token and redirect to /login */}
            {requireAuth() && (
              <button className="w-full text-left px-3 py-2 rounded hover:bg-white/5" onClick={() => { logout(); navigate('/login'); }}>
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
