# Kota Interactive Plan Picker 🏥

> AI-powered health insurance plan recommendation — find your perfect Kota plan in under 2 minutes.

## What it does

This is an interactive, AI-driven questionnaire that guides users through 6 simple questions about their health needs, priorities, and budget — then uses OpenAI GPT-4o-mini to generate a **personalised health insurance plan recommendation** with detailed, human-readable reasoning.

### Key features

- 🤖 **Real AI integration** — OpenAI GPT-4o-mini analyses user responses holistically and generates personalised recommendations and explanations
- 🎯 **Personalised matching** — Considers situation, coverage needs, health status, priorities, budget, and free-text context
- ✨ **Animated conversational UI** — Smooth transitions between questions using Framer Motion
- 🔄 **Graceful fallback** — Rule-based recommendation engine works without an API key
- 📱 **Fully responsive** — Works on mobile and desktop
- 🎨 **Polished design** — Dark theme matching Kota's brand aesthetic

## Tech stack

- **React 19** + **TypeScript** — Component-based UI
- **Vite** — Fast dev tooling
- **Tailwind CSS v4** — Utility-first styling
- **Framer Motion** — Animations and transitions
- **OpenAI SDK** — GPT-4o-mini for AI recommendations
- **Vitest** + **Testing Library** — Unit tests

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/alanmaizon/kota-hackathon.git
cd kota-hackathon
npm install
```

### 2. Configure the API key (optional)

```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

> **Note:** The app works without an API key using rule-based recommendations as a fallback. With a key, you get fully personalised AI-generated explanations.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Run tests

```bash
npm test
```

### 5. Build for production

```bash
npm run build
```

## The insurance plans

| Plan | Price | Best for |
|------|-------|----------|
| 🌱 Essential | £35/mo | Healthy young professionals, tight budgets |
| 🛡️ Standard | £75/mo | Couples, active professionals |
| ⭐ Premium | £140/mo | Families, mental health, fitness-focused |
| 👑 Elite | £250/mo | Executives, frequent travellers |

## AI integration details

The AI integration is meaningful, not decorative:

1. **System prompt engineering** — A carefully crafted system prompt gives the AI full context about all four Kota plans, their features, pricing, and best-fit profiles
2. **Structured output** — Uses `response_format: { type: 'json_object' }` to get reliable structured responses
3. **Holistic analysis** — The AI considers all 6 dimensions of user input simultaneously, including free-text context
4. **Personalised reasoning** — GPT generates 2-3 paragraphs of warm, conversational explanation specific to the user's answers
5. **Budget-aware** — Prompt instructs the AI to always respect budget constraints

## How the questionnaire works

1. **Situation** — What brings them to insurance today?
2. **Coverage** — Who are they covering?
3. **Health** — Their current health status
4. **Priorities** — Multi-select: dental, mental health, physio, optical, etc.
5. **Budget** — Monthly budget range
6. **Extras** — Free-text for anything else (AI-processed)

## Architecture

```
src/
├── types/index.ts          # TypeScript interfaces
├── data/plans.ts           # Plan data + questionnaire config
├── services/ai.ts          # OpenAI integration + rule-based fallback
├── components/
│   ├── WelcomeScreen.tsx   # Landing page
│   ├── Quiz.tsx            # Animated questionnaire
│   ├── LoadingScreen.tsx   # AI thinking animation
│   └── ResultsView.tsx     # Recommendation display
├── App.tsx                 # State management + screen routing
└── __tests__/              # Unit tests
```
