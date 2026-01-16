# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Itsumo Quiz (いつでもクイズ)** - Full-stack quiz application for corporate education/training with AI-powered problem generation, prediction quizzes, and gamification.

- **Backend**: Hono (TypeScript) on Cloudflare Workers
- **Frontend**: Vanilla JavaScript + TailwindCSS (CDN)
- **Database**: Cloudflare D1 (SQLite-based)
- **AI**: OpenAI integration for question generation and flexible answer verification

## Common Commands

### Development
```bash
npm run dev:sandbox      # Start Wrangler dev server with D1 (port 3000)
npm run dev              # Start Vite dev server only
```

### Database
```bash
npm run db:migrate:local # Apply migrations to local D1
npm run db:seed          # Load test data (seed.sql)
npm run db:reset         # Wipe and reseed local database
npm run db:console:local # Open D1 SQL console
```

### Build & Deploy
```bash
npm run build            # Build with Vite
npm run deploy           # Deploy to Cloudflare Pages (sandbox)
npm run deploy:prod      # Deploy to production
npm run cf-typegen       # Regenerate Cloudflare type definitions
```

### PM2 Server Management
```bash
pm2 start ecosystem.config.cjs  # Start server
pm2 logs quiz-app --nostream    # View logs
pm2 delete quiz-app             # Stop server
```

## Architecture

```
src/
├── index.tsx             # Main Hono app entry, route mounting
├── api.tsx               # Core API (user auth, quiz flow, rankings, admin CRUD)
├── ai-api.tsx            # AI question generation via OpenAI
├── ai-prediction-api.tsx # AI-powered prediction answer verification
├── ai-helper.ts          # OpenAI client configuration and prompts
├── analytics-api.tsx     # Statistics aggregation, knowledge base generation
├── gamification-api.tsx  # Points, badges, leaderboard system
├── knowledge-api.tsx     # Knowledge management and classification
├── learning-api.tsx      # Learning statistics and progress tracking
├── prediction-api.tsx    # Prediction quiz endpoints
└── renderer.tsx          # JSX renderer setup

public/static/
├── app.js                # User-facing quiz UI
└── admin.js              # Admin dashboard UI

migrations/               # D1 schema migrations (0001-0016)
```

## Key Design Patterns

### Problem Distribution
Users receive questions from pool groups (0-9) determined by the last digit of their user ID (`getPoolGroup(userId)`). This prevents answer sharing between users.

### Quiz Types
- **choice**: Multiple choice (4 options)
- **prediction**: Free-form prediction quiz with AI-powered answer verification

### Quiz Modes
- **individual**: Personal score ranking
- **team**: Team average ranking
- **company**: Company-wide average ranking

### Ranking Algorithm
1. Score (higher is better)
2. Answer time (faster is better)
3. Completion time (earlier is better)

### Gamification
- Points: +10 per correct answer, +50 bonus for perfect score
- 11 badge types (prediction master, streak king, perfectionist, etc.)
- Total/weekly/monthly leaderboards

### Knowledge Recognition Levels
- HIGH: accuracy >= 80%
- MEDIUM: 50% <= accuracy < 80%
- LOW: accuracy < 50%

## Database Schema

Core tables: `events`, `questions`, `users`, `answers`, `user_event_status`, `question_categories`, `question_statistics`, `knowledge_base`, `admins`, `user_points`, `user_badges`, `point_history`

Migrations are in `migrations/` directory - always use migration files for schema changes.

## API Structure

- `/api/*` - User endpoints (auth, quiz, rankings, gamification)
- `/admin/api/*` - Admin endpoints (event/question CRUD, AI generation, analytics)
- `/admin/api/ai/*` - AI endpoints (question generation, prediction verification)

## Environment

- Local D1 database stored in `.wrangler/state/v3/d1/`
- OpenAI API key configured in `.dev.vars` file
- Cloudflare Workers compatibility date: 2025-12-26
