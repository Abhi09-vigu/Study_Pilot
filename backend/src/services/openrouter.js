// OpenRouter AI integration for plan generation
// Uses Node's global fetch (Node 18+)

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

function buildPrompt({ subjectsOnly, syllabus, days, dailyHours }) {
  const syllabusText = subjectsOnly && subjectsOnly.length
    ? `Subjects: ${subjectsOnly.join(', ')}`
    : (syllabus || []).map(s => `${s.subject}${s.topics && s.topics.length ? ': ' + s.topics.join(', ') : ''}`).join('\n');
  return `You are Study Pilot, a friendly study coach. The user provided only subject names and wants a plan in ${days} days. Derive gentle subtopics and sessions yourself.\n\nRules:\n- Total duration: ${days} days.\n- Respect daily availability: about ${dailyHours} hours/day, typically 1 hour per session.\n- Alternate subjects and include short breaks.\n- Add a revision day around every 6th day.\n- Each session must include: subject, topic, durationHours (number), priority (high/medium/low), motivationalLine (short, supportive).\n- Avoid overload—keep days realistic and kind.\n\n${syllabusText}\n\nOutput strictly in JSON: {"title": "string", "days": [{"dateOffset": number, "sessions": [{"subject": "string", "topic": "string", "durationHours": number, "priority": "high|medium|low", "motivationalLine": "string"}]}]}. No extra text or markdown.`;
}

export async function generateAIPlan({ subjectsOnly, syllabus, days, dailyHours = 2 }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'openrouter/auto';
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured');
  }
  const prompt = buildPrompt({ subjectsOnly, syllabus, days, dailyHours });

  const body = {
    model,
    messages: [
      { role: 'system', content: 'You are Study Pilot. Respond in strict JSON only.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.4,
  };

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-Title': 'Study Pilot',
      'HTTP-Referer': 'http://localhost:4000'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter error: ${res.status} ${text}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('No content from OpenRouter');

  let json;
  try {
    json = JSON.parse(content);
  } catch (e) {
    throw new Error('Failed to parse OpenRouter JSON');
  }

  if (!json.days || !Array.isArray(json.days)) {
    throw new Error('Invalid AI plan format');
  }

  // Convert to internal planDays structure (date computed by caller)
  const planDays = [];
  for (let i = 0; i < Math.min(days, json.days.length); i++) {
    const day = json.days[i];
    const sessions = (day.sessions || []).map((s, idx) => ({
      subject: s.subject,
      topic: s.topic,
      duration: Number(s.durationHours) || 1,
      priority: ['high','medium','low'].includes((s.priority||'medium')) ? s.priority : (idx === 0 ? 'high' : 'medium'),
      motivationalLine: s.motivationalLine || (idx === 0 ? 'Start strong—one focused win today 💪' : 'Nice and steady—consistency beats intensity 😊'),
      done: false
    }));
    planDays.push({ date: null, sessions, completed: false });
  }
  return { title: json.title || 'AI Study Plan', planDays };
}
