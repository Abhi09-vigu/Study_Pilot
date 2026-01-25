import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export default function MyPlans() {
  const { token } = useContext(AuthContext);
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/plans', token);
        setPlans(res.plans || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) return <div className="container" style={{ padding: 24 }}>Loading your plans…</div>;

  return (
    <div className="container">
      <div className="card">
        <div className="section-title">My Plans</div>
        {error && <div className="error" style={{ marginTop: 8 }}>{error}</div>}
        {plans.length === 0 ? (
          <p className="kicker">No plans yet. Create one to get started!</p>
        ) : (
          <div className="grid">
            {plans.map((p) => (
              <div key={p._id} className="col-12" style={{ marginBottom: 16 }}>
                <div className="session" style={{ background: 'var(--card)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="section-title" style={{ marginBottom: 4 }}>{p.title}</div>
                      <div className="kicker">{new Date(p.startDate).toLocaleDateString()} → {new Date(p.endDate).toLocaleDateString()} {p.ongoing ? '• ongoing' : ''}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    {p.days && p.days.map((d) => (
                      <div key={d._id} style={{ marginBottom: 8 }}>
                        <div className="kicker">{new Date(d.date).toLocaleDateString()} {d.completed ? '• completed' : ''}</div>
                        <ul>
                          {d.sessions && d.sessions.map((s) => (
                            <li key={s._id}>
                              {s.subject}: {s.topic} — {s.duration}h ({s.priority}) {s.done ? '✓' : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
