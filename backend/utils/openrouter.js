// OpenRouter client for AI planning
// Uses fetch (Node 18+) and OPENROUTER_API_KEY from env

const OPENROUTER_URL = process.env.OPENROUTER_URL || 'https://openrouter.ai/api/v1/chat/completions';

async function generateStudyPlan(topics, days = 7) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set');
  }

  const system = `You are Study-Pilot, an academic planner. Create an adaptive, concise daily study plan combining theory and practice. Output strict JSON with keys: days (number), schedule (array of { day: number, items: [{ topic: string, type: "theory"|"practice", duration_minutes: number }] }).`;
  const user = `Topics: ${topics.map((t) => t.title).join(', ')}\nDays: ${days}\nConstraints: Sessions ~45 min; interleave theory and practice; prioritize earlier due dates if provided.`;

  const resp = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.4,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenRouter error: ${resp.status} ${text}`);
  }
  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content || '{}';
  try {
    return JSON.parse(content);
  } catch {
    // If model returned markdown, try to extract JSON block
    const match = content.match(/```json[\s\S]*?```/i);
    if (match) {
      return JSON.parse(match[0].replace(/```json|```/g, ''));
    }
    throw new Error('Failed to parse AI response');
  }
}

// Explain a topic in concise, student-friendly terms.
// Returns markdown string with overview, key points, and quick tips.
async function explainTopic(topic, type = 'theory') {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set');
  }

  const system = `You are Study-Pilot, a helpful tutor. Explain topics clearly for college students. Use concise markdown with headings and bullet points. Avoid fluff.`;
  const user = `Explain the topic: "${topic}"${type ? ` (focus: ${type})` : ''}.
Include:
- Overview in 2-3 sentences
- Key concepts/bullets (5-7)
- If practice: a short example/exercise
- Tips and common pitfalls
Keep it under 250-300 words.`;

  const resp = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.3,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenRouter error: ${resp.status} ${text}`);
  }
  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content || '';
  return content;
}

// Generate multiple-choice questions (MCQs) for a topic.
// Returns strict JSON: { questions: [{ q, options: [..], answer_index, explanation }] }
async function generateMCQs(topic, count = 5) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set');
  }

  const system = `You are Study-Pilot, an exam practice generator. Create concise MCQs suitable for college students. Return strict JSON only.`;
  const user = `Create ${count} MCQs for the topic: "${topic}".
Format strictly as JSON object with key "questions" containing an array of objects:
{ q: string, options: string[4], answer_index: 0-3, explanation: string }.
Keep difficulty moderate and explanations brief.`;

  const resp = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.3,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenRouter error: ${resp.status} ${text}`);
  }
  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content || '{}';
  try {
    const parsed = JSON.parse(content);
    return parsed;
  } catch {
    const match = content.match(/```json[\s\S]*?```/i);
    if (match) {
      return JSON.parse(match[0].replace(/```json|```/g, ''));
    }
    throw new Error('Failed to parse MCQ response');
  }
}

module.exports = { generateStudyPlan, explainTopic, generateMCQs };
