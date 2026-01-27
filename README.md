# Study-Pilot — AI-Based Study Planner & Reminder System

Theme: Dark chalkboard / charcoal gradient with white typography and minimalist chalk-style accents.

## System Architecture
- Frontend: React (Vite) + Tailwind (chalkboard theme)
- Backend: Node.js + Express
- Database: MongoDB (Mongoose models)
- Auth: JWT
- AI Planner: Rule-based (OpenAI-ready)
- Automation: Cron job for reminders
- Notifications: Email (nodemailer) + WhatsApp mock

## Technical Workflow
Login → Syllabus Input → AI Analysis → Plan Generation (Theory + Practice) → Automated Reminders → Task Completion → Progress Update → AI Rescheduling

## Database Schema
- `User`: name, email, password(hash), preferences(reminders, dailyHours), behavior(consistencyScore, lastActiveAt)
- `Syllabus`: user, courseTitle, topics[{ title, estimatedHours, dueDate, tags }]
- `Plan`: user, date, items[{ topicTitle, type(theory|practice), durationMinutes, status, notes }], totalMinutes
- `Task`: user, title, topicTitle, type, dueAt, status, feedback
- `Reminder`: user, message, dueAt, channel(email|whatsapp), sent, task?, plan?

## REST APIs (prefix: /api)
- Auth: `POST /auth/register`, `POST /auth/login`
- Syllabus: `GET /syllabus`, `POST /syllabus`
- Planner: `POST /planner/generate`, `GET /planner/today`, `POST /planner/status`
- Tasks: `GET /tasks`, `PATCH /tasks/:id`
- Reminders: `GET /reminders`, `POST /reminders`

## Automation
- Cron: every 5 minutes, checks due reminders and sends email/WhatsApp (mock) then marks as `sent`.

## Running Locally
1. Backend
```bash
cd Backend
npm install
npm run start
```
2. Frontend
```bash
cd Frontend/vite-project
npm install
npm run dev
```
Open http://localhost:5173 with dev proxy to backend.

## Environment Setup
- Add your MongoDB connection string in `Backend/.env` under `MONGO_URI`.
- Optional email config for reminders: set `EMAIL_USER`, `EMAIL_PASS`, `SMTP_HOST`, `SMTP_PORT`.
- `JWT_SECRET` defaults to `dev_secret` — change this for production.

## Theme & UI Notes

## Future Enhancements
- Integrate OpenAI planning and feedback.
- Add spaced repetition scheduling.
- Real email/WhatsApp providers.
- N8n workflows for visual automation.
