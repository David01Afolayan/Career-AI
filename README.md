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
2. Set up your local SQLite database in `.env`:
   DATABASE_URL="file:./dev.db"
3. Sync the Prisma schema to the database:
   npx prisma db push
4. Start the app:
   npm run dev

## Project structure

The app includes UI pages, reusable components, a Prisma schema, and machine learning scripts for career prediction.
