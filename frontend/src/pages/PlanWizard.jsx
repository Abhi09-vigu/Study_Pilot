import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export default function PlanWizard() {
  const { token, setView } = useContext(AuthContext);
  const [subjects, setSubjects] = useState(['']);
  const [useAI, setUseAI] = useState(true);
  const [durationDays, setDurationDays] = useState('');
  const [dailyHours, setDailyHours] = useState('2');
  const [error, setError] = useState('');
  const [plan, setPlan] = useState(null);
  const [notice, setNotice] = useState('');

  const addSubject = () => setSubjects([...subjects, '']);
  const updateSubject = (i, value) => {
    const next = [...subjects];
    next[i] = value;
    setSubjects(next);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!durationDays) {
      setError('How many days would you like to complete this syllabus in?');
      return;
    }
    const simpleSubjects = subjects.map(s => s.trim()).filter(Boolean);
    if (!simpleSubjects.length) {
      setError('Please add at least one subject');
      return;
    }
    try {
      const res = await api.post('/plans/create', { title: 'My Plan', subjects: simpleSubjects, durationDays: Number(durationDays), dailyHours: Number(dailyHours), useAI }, token);
      if (res.aiFallback) {
        setNotice('AI helper was offline—generated a balanced plan anyway 😊');
      } else {
        setNotice('');
      }
      setPlan(res.plan);
    } catch (err) {
      setError(err.message);
    }
  };

  if (plan) {
    return (
      <div className="card" style={{ maxWidth: 840, margin: '24px auto' }}>
        <div className="section-title">Plan created 🎉</div>
        <p className="kicker">We balanced your days to keep stress low.</p>
        {notice && <div className="helper" style={{ marginBottom: 8 }}>{notice}</div>}
        <div className="grid">
          {plan.days.map(day => (
            <div className="col-6" key={day._id}>
              <div className="session">
                <strong>{new Date(day.date).toLocaleDateString()}:</strong>
                <ul>
                  {day.sessions.map(s => (
                    <li key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div>
                        {s.done ? '✅ ' : ''}{s.subject} — {s.topic} • {s.duration}h • {s.priority}
                        <div className="meta">{s.motivationalLine}</div>
                      </div>
                      {!s.done && (
                        <button
                          className="button button-primary"
                          onClick={async () => {
                            try {
                              const res = await api.post('/tasks/complete', { planId: plan._id, dayId: day._id, sessionId: s._id }, token);
                              // Update local plan state with response
                              setPlan(res.plan);
                            } catch (err) {
                              setError(err.message);
                            }
                          }}
                        >Mark done</button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          <button className="button button-primary" onClick={() => setView('dashboard')}>Back to dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 800, margin: '24px auto' }}>
      <div className="section-title">Build your plan</div>
      <p className="kicker">First add your syllabus, then confirm duration.</p>
      <form onSubmit={onSubmit}>
          {subjects.map((s, i) => (
            <div key={i} className="session">
              <label className="label">Subject</label>
              <input className="input" placeholder="e.g., Math" value={s} onChange={e => updateSubject(i, e.target.value)} />
            </div>
          ))}
        <button type="button" className="button button-secondary" onClick={addSubject}>+ Add subject</button>
        <div style={{ marginTop: 12 }}>
          <label className="label">Days to complete</label>
          <input className="input" placeholder="e.g., 14" value={durationDays} onChange={e => setDurationDays(e.target.value)} />
          <div style={{ height: 8 }} />
          <label className="label">Daily hours</label>
          <input className="input" placeholder="e.g., 2" value={dailyHours} onChange={e => setDailyHours(e.target.value)} />
          <label style={{ display: 'block', marginTop: 8 }}>
            <input type="checkbox" checked={useAI} onChange={e => setUseAI(e.target.checked)} />
            {' '}Use AI to generate plan
          </label>
        </div>
        {error && <div className="error" style={{ marginBottom: 8 }}>{error}</div>}
        <button type="submit" className="button button-primary">Generate plan</button>
      </form>
    </div>
  );
}
