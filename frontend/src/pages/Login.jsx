import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, setView } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 480, margin: '32px auto' }}>
      <div className="section-title">Welcome to Study Pilot</div>
      <p className="kicker">Friendly study coach—log in to continue.</p>
      <form onSubmit={onSubmit}>
        <label className="label">Email</label>
        <input className="input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        <div style={{ height: 8 }} />
        <label className="label">Password</label>
        <input className="input" placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <div className="error" style={{ marginTop: 8 }}>{error}</div>}
        <div style={{ marginTop: 12 }}>
          <button type="submit" className="button button-primary" style={{ width: '100%' }}>Log in</button>
        </div>
      </form>
      <p className="helper" style={{ marginTop: 12 }}>New here? <button className="button button-secondary" onClick={() => setView('signup')}>Sign up</button></p>
    </div>
  );
}
