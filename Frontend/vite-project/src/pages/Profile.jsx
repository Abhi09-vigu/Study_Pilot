// Profile page
// - Protected route
// - Fetches logged-in user details using JWT
// - Shows Name, Email, and Account creation date
// - Allows updating name/email and uploading an avatar image
import { useEffect, useState } from 'react';
import { api, apiAssetUrl } from '../lib/api';
import Navbar from '../components/Navbar';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');

  // Fetch user details from backend (JWT required). Uses /auth/me.
  useEffect(() => {
    (async () => {
      try {
        const me = await api('/auth/me');
        setUser(me);
        setName(me.name || '');
        setEmail(me.email || '');
      } catch (e) { setErr(e.message); }
    })();
  }, []);

  // Show local preview for selected avatar image
  useEffect(() => {
    if (!file) { setPreview(''); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Submit profile changes: name/email and optional avatar
  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setSaving(true);
    try {
      const form = new FormData();
      form.append('name', name);
      form.append('email', email);
      if (file) form.append('avatar', file);
      const updated = await api('/auth/profile', { method: 'PATCH', body: form });
      setUser(updated);
      setFile(null);
      setPreview('');
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  const avatarSrc = apiAssetUrl(user?.avatarUrl);

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <Navbar />
      <div className="chalk-card p-6 mt-4">
        <h2 className="heading text-2xl">Profile</h2>
        <div className="chalk-divider my-4" />
        {err && <p className="text-red-300 mb-3">{err}</p>}
        {!user ? <p>Loading...</p> : (
          <div className="grid md:grid-cols-3 gap-6 items-start">
            <div className="flex flex-col items-center gap-3">
              <div className="w-28 h-28 rounded-full overflow-hidden border border-white/10 bg-charcoal-800">
                {(preview || avatarSrc) ? (
                  <img src={preview || avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-chalk/50">No Avatar</div>
                )}
              </div>
              <label className="text-sm">
                <span className="block text-chalk/70 mb-1">Change Avatar</span>
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>
            </div>
            <form className="md:col-span-2 grid gap-3" onSubmit={onSubmit}>
              <label className="grid gap-1">
                <span className="text-chalk/70">Name</span>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
              </label>
              <label className="grid gap-1">
                <span className="text-chalk/70">Email</span>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              <div className="text-chalk/70">Joined: {new Date(user.createdAt).toLocaleString()}</div>
              <div className="flex gap-3">
                <button className="btn" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
