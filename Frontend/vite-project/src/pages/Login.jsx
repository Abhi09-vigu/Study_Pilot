import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  async function onSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const data = await api('/auth/login', { method: 'POST', body: payload });
      if (data.token) {
        localStorage.setItem('sp_token', data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      alert('Login failed: ' + err.message);
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="chalk-card p-6 w-full max-w-md md:max-w-lg">
        <h2 className="heading text-2xl">Login</h2>
        <div className="chalk-divider my-4" />
        <form onSubmit={onSubmit} className="grid gap-4">
          <input name="email" placeholder="Email" className="w-full px-3 py-2 bg-charcoal-800 text-chalk border border-white/10 rounded" />
          <input name="password" placeholder="Password" type="password" className="w-full px-3 py-2 bg-charcoal-800 text-chalk border border-white/10 rounded" />
          <button className="w-full px-4 py-2 rounded border border-white/20 hover:border-white/40">Sign In</button>
        </form>
        <p className="mt-3 text-chalk/70">No account? <Link to="/register" className="underline">Sign up</Link></p>
      </div>
    </div>
  );
}
