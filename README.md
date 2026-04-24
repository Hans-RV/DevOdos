# DevOdos

DevOdos is an AI-powered learning roadmap platform for developers. It helps users define a software career goal, generates a structured learning path, explains each topic in depth, and allows exporting learning artifacts to PDF.

## Problem It Solves

Many learners struggle with:

- Choosing what to learn first for a specific developer role.
- Converting broad goals (for example, "Full Stack Developer") into a practical step-by-step learning sequence.
- Finding reliable, contextual explanations for each roadmap topic.
- Tracking progress in one place and keeping a portable version of their plan.

DevOdos solves this by combining guided roadmap generation, topic-level AI explanations, lightweight progress tracking, and PDF export in one focused workflow.

## Core Features

- Personalized roadmap generation based on goal, level, language, and optional context.
- AI-driven topic explanations with structured sections (overview, implementation, best practices, pitfalls, advanced topics).
- Google Sign-In based onboarding flow.
- Progress tracking UI with completed-topic state.
- Single-topic and full-roadmap PDF export.
- Input validation to keep requests coding-focused.
- Fallback roadmap generation when AI API key is unavailable.
- Health endpoint for quick API/service status checks.

## Tech Stack

### Frontend

- Next.js 16 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- Lucide React icons

### Backend / API

- Next.js Route Handlers (`app/api/*`)
- Groq SDK (`llama-3.3-70b-versatile`) for roadmap and explanation generation
- Google Auth Library for token verification

### Document Export

- jsPDF
- html2canvas (available in dependencies)

### Tooling

- ESLint (Next.js config)
- PostCSS + Tailwind
- TypeScript strict mode

## How It Works

1. User signs in with Google.
2. User enters:
   - Career goal
   - Current level
   - Preferred language
   - Optional details
3. DevOdos validates input and calls `/api/generate-roadmap`.
4. API returns a roadmap JSON (AI-generated, or fallback if no Groq key).
5. User explores nodes/subtopics, marks completion, and opens topic details.
6. Topic modal calls `/api/explain-topic` for a detailed explanation.
7. User exports either the full roadmap or a single topic guide as PDF.

## Potential Enhancements

- Server-side user profiles and persistent progress with a database.
- Team/classroom mode for mentors and cohorts.
- Built-in quizzes and adaptive assessment loops.
- Resource recommendation ranking by learner profile.
- Export/share roadmap links with versioning.


