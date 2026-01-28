import { Routes, Route, Link } from 'react-router-dom';
import './index.css';
import { SparklesCore } from '@/components/ui/sparkles';
import { api, requireAuth, logout } from './lib/api';
import { marked } from 'marked';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';

function Landing() {
  return (
    <div className="relative py-24 text-center min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Sparkles background layer */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1.2}
          particleDensity={600}
          particleColor="#FFFFFF"
        />
      </div>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <header className="mb-8 chalk-scribble">
          <h1 className="heading text-5xl animated-title">Study-Pilot</h1>
          <p className="subheading mt-3 animated-title">AI-based study planner & reminders — simple, adaptive, practical.</p>
        </header>
        <div className="mt-10">
          <Link className="px-6 py-3 rounded border border-white/30 hover:border-white/50 animated-title" to="/login">Explore Us</Link>
        </div>
      </div>
    </div>
  );
}


import { useEffect, useState } from 'react';
function Dashboard() {
  const token = localStorage.getItem('sp_token');
  const [plan, setPlan] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  // Explanation modal state
  const [expOpen, setExpOpen] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expContent, setExpContent] = useState('');
  const [expLoading, setExpLoading] = useState(false);
  const [expIdx, setExpIdx] = useState(-1);
  // MCQ modal state
  const [mcqOpen, setMcqOpen] = useState(false);
  const [mcqLoading, setMcqLoading] = useState(false);
  const [mcqQs, setMcqQs] = useState([]);
  const [mcqSel, setMcqSel] = useState({});
  const [mcqResult, setMcqResult] = useState(null);

  useEffect(() => {
    if (!requireAuth()) return;
    (async () => {
      setLoading(true);
      try {
        const today = await api('/planner/today');
        setPlan(today);
        const t = await api('/tasks');
        setTasks(t);
        const r = await api('/reminders');
        setReminders(r);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  async function upsertSyllabus(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const courseTitle = form.get('courseTitle');
    const topics = (form.get('topics') || '').split('\n').filter(Boolean).map(t => ({ title: t, estimatedHours: 2 }));
    try {
      await api('/syllabus', { method: 'POST', body: { courseTitle, topics } });
      alert('Syllabus saved.');
    } catch (e) { alert('Error: ' + e.message); }
  }

  async function generatePlan() {
    try {
      const p = await api('/planner/generate', { method: 'POST', body: {} });
      setPlan(p);
      alert(`Plan generated: ${p?.items?.length || 0} items`);
    } catch (e) { alert('Error: ' + e.message); }
  }

  async function updatePlanItem(idx, status) {
    if (!plan?._id) return;
    try {
      const p = await api('/planner/status', { method: 'POST', body: { planId: plan._id, index: idx, status } });
      setPlan(p);
    } catch (e) { alert('Error: ' + e.message); }
  }

  // Determine if an item is unlocked: first item or previous is done
  function isUnlocked(idx) {
    if (!plan?.items) return false;
    return idx === 0 || (plan.items[idx - 1]?.status === 'done');
  }

  // Fetch AI explanation for a topic and show modal
  async function startWithExplain(idx) {
    const item = plan?.items?.[idx];
    if (!item) return;
    if (!isUnlocked(idx)) { alert('Please complete the previous task first.'); return; }
    setExpTitle(item.topicTitle);
    setExpLoading(true);
    setExpContent('');
    setExpOpen(true);
    setExpIdx(idx);
    try {
      // Mark as in-progress
      await updatePlanItem(idx, 'in-progress');
      // Request AI explanation
      const res = await api('/planner/explain', { method: 'POST', body: { topic: item.topicTitle, type: item.type } });
      setExpContent(res.content || 'No content');
    } catch (e) {
      setExpContent(`Error: ${e.message}`);
    } finally {
      setExpLoading(false);
    }
  }

  // Load MCQs for current explanation topic
  async function openMcqs() {
    if (expIdx < 0) return;
    setMcqOpen(true);
    setMcqLoading(true);
    setMcqQs([]);
    setMcqSel({});
    setMcqResult(null);
    try {
      const res = await api('/planner/mcqs', { method: 'POST', body: { topic: expTitle, count: 5 } });
      setMcqQs(res.questions || []);
    } catch (e) {
      alert('MCQ error: ' + e.message);
      setMcqOpen(false);
    } finally {
      setMcqLoading(false);
    }
  }

  async function submitMcqs() {
    if (expIdx < 0) return;
    const answers = mcqQs.map((_, i) => mcqSel[i] ?? -1);
    if (answers.some((a) => a === -1)) {
      alert('Please answer all questions.');
      return;
    }
    try {
      const questions = mcqQs.map((q) => ({ answer_index: q.answer_index }));
      const res = await api('/planner/mcqs/submit', { method: 'POST', body: { planId: plan._id, index: expIdx, answers, questions, min: 3 } });
      setMcqResult(res.result);
      if (res.passed) {
        setPlan(res.plan);
        setMcqOpen(false);
        setExpOpen(false);
        setExpIdx(-1);
      } else {
        // Keep explanation open to read again; allow retake
        alert('Score below minimum 3. Please read again and retake.');
      }
    } catch (e) {
      alert('Submit error: ' + e.message);
    }
  }

  async function updateTask(id, status) {
    try {
      const t = await api(`/tasks/${id}`, { method: 'PATCH', body: { status } });
      setTasks((prev) => prev.map((x) => (x._id === id ? t : x)));
    } catch (e) { alert('Error: ' + e.message); }
  }

  async function scheduleReminder(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const r = await api('/reminders', { method: 'POST', body: payload });
      setReminders((prev) => [r, ...prev]);
      e.currentTarget.reset();
    } catch (e) { alert('Error: ' + e.message); }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <Navbar />
      <header className="mb-8 chalk-scribble">
        <h1 className="heading text-3xl">Dashboard</h1>
        <p className="subheading">Presentation-style sections for screenshots</p>
      </header>

      {/* Action panel */}
      <div className="chalk-card p-6 mt-8">
        <h3 className="heading text-xl">Quick Actions</h3>
        <div className="chalk-divider my-4" />
        <div className="grid md:grid-cols-2 gap-6">
          <form onSubmit={upsertSyllabus} className="grid gap-3">
            <input name="courseTitle" placeholder="Course Title" className="px-3 py-2 bg-charcoal-800 text-chalk border border-white/10 rounded" />
            <textarea name="topics" rows="5" placeholder="Enter topics (one per line)" className="px-3 py-2 bg-charcoal-800 text-chalk border border-white/10 rounded" />
            <button className="px-4 py-2 rounded border border-white/20 hover:border-white/40">Save Syllabus</button>
          </form>
          <div>
            <button onClick={generatePlan} className="px-4 py-2 rounded border border-white/20 hover:border-white/40">Generate Today’s Plan</button>
            <p className="mt-2 text-sm text-chalk/70">AI will interleave theory and practice based on available hours.</p>
            <button onClick={async () => { try { const data = await api('/planner/ai', { method: 'POST', body: { days: 7 } }); alert(`AI plan created for ${data.days ?? 'N'} days`); } catch (e) { alert('AI error: ' + e.message); } }} className="mt-3 px-4 py-2 rounded border border-white/20 hover:border-white/40">AI Plan (OpenRouter)</button>
          </div>
        </div>
      </div>

      {/* Live Plan */}
      <div className="chalk-card p-6 mt-6">
        <h3 className="heading text-xl">Today’s Plan</h3>
        <div className="chalk-divider my-4" />
        {loading && <p>Loading...</p>}
        {!loading && (!plan?.items?.length ? <p>No items yet.</p> : (
          <ul className="grid gap-3">
            {plan.items.map((it, idx) => (
              <li key={idx} className="flex items-center justify-between">
                <div>
                  <span className="mr-2">[{it.type}]</span>
                  <span className="font-medium">{it.topicTitle}</span>
                  <span className="ml-2 text-chalk/70">{it.durationMinutes} min</span>
                </div>
                <div className="flex gap-2">
                  {it.status === 'done' ? (
                    <span className="px-2 py-1 border border-white/20 rounded text-chalk/70">Completed</span>
                  ) : (
                    <button
                      className="px-2 py-1 border border-white/20 rounded disabled:opacity-50"
                      disabled={!isUnlocked(idx)}
                      onClick={() => startWithExplain(idx)}
                    >Start</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ))}
      </div>

      {/* Explanation Modal */}
      {expOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto" onClick={() => setExpOpen(false)}>
          <div className="max-w-3xl w-[92%] mx-auto my-10 chalk-card p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-xl">Topic: {expTitle}</h3>
              <button className="px-3 py-1 rounded border border-white/20 hover:border-white/40" onClick={() => setExpOpen(false)}>Close</button>
            </div>
            <div className="chalk-divider my-3" />
            {expLoading ? (
              <p>Loading explanation...</p>
            ) : (
              <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(expContent || '') }} />
            )}
            {!expLoading && (
              <div className="mt-4 flex justify-end">
                <button className="px-4 py-2 rounded border border-white/20 hover:border-white/40" onClick={openMcqs}>Take MCQs</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MCQ Modal */}
      {mcqOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto" onClick={() => setMcqOpen(false)}>
          <div className="max-w-3xl w-[92%] mx-auto my-10 chalk-card p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-xl">MCQs: {expTitle}</h3>
              <button className="px-3 py-1 rounded border border-white/20 hover:border-white/40" onClick={() => setMcqOpen(false)}>Close</button>
            </div>
            <div className="chalk-divider my-3" />
            {mcqLoading ? (
              <p>Loading questions...</p>
            ) : (!mcqQs.length ? (
              <p>No questions returned.</p>
            ) : (
              <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); submitMcqs(); }}>
                {mcqQs.map((q, i) => (
                  <div key={i} className="grid gap-2">
                    <div className="font-medium">Q{i + 1}. {q.q}</div>
                    <div className="grid gap-2">
                      {(q.options || []).map((opt, j) => (
                        <label key={j} className="flex items-center gap-2">
                          <input type="radio" name={`q${i}`} checked={mcqSel[i] === j} onChange={() => setMcqSel((prev) => ({ ...prev, [i]: j }))} />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="mt-2 flex justify-end">
                  <button className="px-4 py-2 rounded border border-white/20 hover:border-white/40" type="submit">Submit Answers</button>
                </div>
                {mcqResult && (
                  <div className="mt-4 chalk-card p-4">
                    <div>Score: {mcqResult.marks}/{mcqResult.total}</div>
                    <div>Correct: {mcqResult.correct} | Wrong: {mcqResult.wrong}</div>
                    <div className="mt-2 text-chalk/70">Minimum required: {mcqResult.min}</div>
                    {!mcqResult.passed && (
                      <div className="mt-3 flex justify-end">
                        <button className="px-4 py-2 rounded border border-white/20 hover:border-white/40" type="button" onClick={openMcqs}>Retake MCQs</button>
                      </div>
                    )}
                  </div>
                )}
              </form>
            ))}
          </div>
        </div>
      )}

      {/* Tasks */}
      <div className="chalk-card p-6 mt-6">
        <h3 className="heading text-xl">Practical Tasks</h3>
        <div className="chalk-divider my-4" />
        {!tasks.length ? <p>No tasks.</p> : (
          <ul className="grid gap-3">
            {tasks.map((t) => (
              <li key={t._id} className="flex items-center justify-between">
                <div>
                  <span className="mr-2">{t.type}</span>
                  <span className="font-medium">{t.title}</span>
                  <span className="ml-2 text-chalk/70">{t.status}</span>
                </div>
                <div className="flex gap-2">
                  {t.status === 'done' ? (
                    <span className="px-2 py-1 border border-white/20 rounded text-chalk/70">Completed</span>
                  ) : (
                    <span className="px-2 py-1 border border-white/20 rounded text-chalk/50">Locked</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Reminders */}
      <div className="chalk-card p-6 mt-6">
        <h3 className="heading text-xl">Reminders</h3>
        <div className="chalk-divider my-4" />
        <form onSubmit={scheduleReminder} className="grid md:grid-cols-3 gap-3 items-end">
          <input name="message" placeholder="Message" className="px-3 py-2 bg-charcoal-800 text-chalk border border-white/10 rounded" />
          <input name="dueAt" type="datetime-local" className="px-3 py-2 bg-charcoal-800 text-chalk border border-white/10 rounded" />
          <select name="channel" className="px-3 py-2 bg-charcoal-800 text-chalk border border-white/10 rounded">
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp (mock)</option>
          </select>
          <button className="px-4 py-2 rounded border border-white/20 hover:border-white/40">Schedule</button>
        </form>
        <ul className="grid gap-3 mt-4">
          {reminders.map((r) => (
            <li key={r._id} className="flex items-center justify-between">
              <div>
                <span className="mr-2">{r.channel}</span>
                <span className="font-medium">{r.message}</span>
                <span className="ml-2 text-chalk/70">{new Date(r.dueAt).toLocaleString()}</span>
              </div>
              <span className="text-chalk/70">{r.sent ? 'Sent' : 'Pending'}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <button className="px-4 py-2 rounded border border-white/20 hover:border-white/40" onClick={() => { logout(); window.location.href = '/login'; }}>Logout</button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    </Routes>
  );
}
