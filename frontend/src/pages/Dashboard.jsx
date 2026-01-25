import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export default function Dashboard({ onStartPlan }) {
  const { user, token, logout } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/dashboard', token);
        setData(res);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [token]);

  if (!data) return <div className="container" style={{ padding: 24 }}>Loading dashboard…</div>;

  return (
    <div className="container">
      <div className="card">
        <div className="section-title">{data.greeting}</div>
        <p className="kicker">Your supportive, gentle study space.</p>
        <div className="grid">
          <div className="col-6">
            <div className="section-title">Profile</div>
            <div className="session">
              <div>Name: {data.profile.name}</div>
              <div>Academic level: {data.profile.academicLevel}</div>
              <div>Focus level: {data.profile.focusLevel}</div>
            </div>
          </div>
          <div className="col-6">
            <div className="section-title">Progress</div>
            <div className="session">
              <div>Completed tasks: {data.progress.completedTasks}</div>
              <div>Ongoing plans: {data.progress.ongoingPlans}</div>
              <div>Current streak: {data.progress.streak} day(s)</div>
              <div>Total plans: {data.progress.totalPlans}</div>
              <div style={{ marginTop: 8 }}>
                Recent plans:
                <ul>
                  {data.progress.recentPlans.map(p => (
                    <li key={p.id}>{p.title} ({new Date(p.startDate).toLocaleDateString()} → {new Date(p.endDate).toLocaleDateString()}) {p.ongoing ? '• ongoing' : ''}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="kicker">{data.encouragement}</p>
          <button className="button button-primary" onClick={onStartPlan}>Create a new plan</button>
        </div>
        {error && <div className="error" style={{ marginTop: 8 }}>{error}</div>}
      </div>
    </div>
  );
}
