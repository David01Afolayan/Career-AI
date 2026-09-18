# Career AI

A career guidance and skills recommendation platform for students and job seekers.

## Features

- User authentication
- Skills and personality assessment
- Career matching and recommendations
- Learning roadmap tracking
- Admin dashboard overview

## Tech Stack

- Next.js
- TypeScript
- Prisma
- PostgreSQL
- Python ML scripts

## Getting started

1. Install dependencies:
   npm install
2. Set up your local PostgreSQL database in `.env`:
   DATABASE_URL="postgresql://user:password@localhost:5432/career_ai"
3. Sync the Prisma schema to the database:
   npx prisma db push
4. Start the app:
   npm run dev

Password reset emails require SMTP configuration. Add these variables to `.env`
or the deployment environment:

```text
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-mailbox@example.com"
SMTP_PASSWORD="your-mailbox-password"
SMTP_FROM="CareerAI <your-mailbox@example.com>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

To use AI recommendations locally, start the ML service in a second terminal from
the `ml` directory:

```text
uvicorn app:app --reload --port 8000
```

Set `ML_API_KEY` to the same value for both the Next.js app and the ML service.

## Render deployment

This app is configured for Render using a Node web service.

1. Create a PostgreSQL database on Render.
2. Add the following environment variables in Render:
   - `DATABASE_URL`
   - `AUTH_SECRET` (generate a secure random value)
   - `AUTH_TRUST_HOST=true`
   - `NEXT_PUBLIC_APP_URL=https://your-render-domain.onrender.com`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_USER`
   - `SMTP_PASSWORD`
   - `SMTP_FROM`
3. Connect the GitHub repository and deploy the service.
4. `render.yaml` creates both the Next.js app and the `career-ai-ml` service.
   Copy the generated `ML_API_KEY` from the ML service into the Next.js service.
5. Render will automatically run Prisma migrations before startup via `render.yaml`.

## Project structure

The app includes UI pages, reusable components, a Prisma schema, and machine learning scripts for career prediction.
