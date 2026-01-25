import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

export default function Signup() {
  const { signup, setView } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [academicLevel, setAcademicLevel] = useState('High School');
  const [focusLevel, setFocusLevel] = useState('Medium');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signup({ name, email, password, academicLevel, focusLevel });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 560, margin: '32px auto' }}>
      <div className="section-title">Create your SmartStudy account</div>
      <form onSubmit={onSubmit} className="grid">
        <div className="col-6">
          <label className="label">Name</label>
          <input className="input" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="col-6">
          <label className="label">Email</label>
          <input className="input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="col-6">
          <label className="label">Password</label>
          <input className="input" placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div className="col-3">
          <label className="label">Academic level</label>
          <select className="input" value={academicLevel} onChange={e => setAcademicLevel(e.target.value)}>
            <option>High School</option>
            <option>Undergraduate</option>
            <option>Graduate</option>
            <option>Other</option>
          </select>
        </div>
        <div className="col-3">
          <label className="label">Focus level</label>
          <select className="input" value={focusLevel} onChange={e => setFocusLevel(e.target.value)}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
        {error && <div className="col-12 error" style={{ marginTop: 8 }}>{error}</div>}
        <div className="col-12" style={{ marginTop: 12 }}>
          <button type="submit" className="button button-primary" style={{ width: '100%' }}>Sign up</button>
        </div>
      </form>
      <p className="helper" style={{ marginTop: 12 }}>Already have an account? <button className="button button-secondary" onClick={() => setView('login')}>Log in</button></p>
    </div>
  );
}
