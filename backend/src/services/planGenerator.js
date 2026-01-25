// Generates a balanced study plan following SmartStudy rules
export function generatePlan({ syllabus, days, dailyHours = 2, startDate = new Date() }) {
  // Flatten syllabus into list of {subject, topic}
  const items = [];
  for (const s of syllabus) {
    if (Array.isArray(s.topics) && s.topics.length) {
      for (const t of s.topics) items.push({ subject: s.subject, topic: t });
    }
  }
  // Subjects-only fallback: create generic focus items
  if (items.length === 0 && Array.isArray(syllabus) && syllabus.length) {
    for (const s of syllabus) {
      items.push({ subject: s.subject, topic: 'Core concepts' });
    }
  }

  const sessionsPerDay = Math.max(1, Math.min(4, Math.floor(dailyHours))); // cap sessions

  const planDays = [];
  let date = new Date(startDate);
  let idx = 0;
  for (let d = 1; d <= days; d++) {
    const daySessions = [];
    const isRevisionDay = d % 6 === 0; // every ~6th day

    if (isRevisionDay) {
      const recent = planDays.slice(-5).flatMap(day => day.sessions).slice(-sessionsPerDay);
      for (const s of recent) {
        daySessions.push({
          subject: s.subject,
          topic: `Revision: ${s.topic}`,
          duration: 1,
          priority: 'medium',
          motivationalLine: 'Quick revision to keep things fresh ✨',
          done: false
        });
      }
      if (daySessions.length === 0) {
        daySessions.push({
          subject: 'Wellness',
          topic: 'Light review + rest',
          duration: 1,
          priority: 'low',
          motivationalLine: 'Recovery matters—short, mindful review today 🌿',
          done: false
        });
      }
    } else {
      for (let s = 0; s < sessionsPerDay && idx < items.length; s++) {
        const item = items[idx++];
        daySessions.push({
          subject: item.subject,
          topic: item.topic,
          duration: 1,
          priority: s === 0 ? 'high' : 'medium',
          motivationalLine: s === 0 ? 'Start strong—one focused win today 💪' : 'Nice and steady—consistency beats intensity 😊',
          done: false
        });
      }
      if (daySessions.length === 0) {
        daySessions.push({
          subject: 'Flex Day',
          topic: 'Catch-up or rest',
          duration: 1,
          priority: 'low',
          motivationalLine: 'Light day—use it to breathe or catch up 👍',
          done: false
        });
      }
    }

    planDays.push({ date: new Date(date), sessions: daySessions, completed: false });
    date.setDate(date.getDate() + 1);
  }

  return planDays;
}

export function adaptPlanAfterMiss({ planDays, missedSessionId }) {
  const allSessions = [];
  for (const day of planDays) for (const s of day.sessions) allSessions.push({ day, session: s });
  const missed = allSessions.find(x => String(x.session._id) === String(missedSessionId));
  if (!missed) return planDays;

  missed.day.sessions = missed.day.sessions.filter(s => String(s._id) !== String(missedSessionId));

  for (let i = planDays.findIndex(d => d === missed.day) + 2; i < planDays.length; i++) {
    const day = planDays[i];
    const lowSlots = day.sessions.filter(s => s.priority === 'low');
    if (lowSlots.length > 0) {
      const session = { ...missed.session, priority: 'low', motivationalLine: 'No stress—we gently rescheduled this for you 😊', done: false };
      day.sessions.push(session);
      break;
    }
  }
  return planDays;
}
