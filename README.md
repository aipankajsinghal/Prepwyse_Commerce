# PrepWyse Commerce - AI-Powered EdTech Platform

[![CI Pipeline](https://github.com/aipankajsinghal/Prepwyse_Commerce/workflows/CI%20Pipeline/badge.svg)](https://github.com/aipankajsinghal/Prepwyse_Commerce/actions)
[![Docker Build](https://github.com/aipankajsinghal/Prepwyse_Commerce/workflows/Docker%20Build/badge.svg)](https://github.com/aipankajsinghal/Prepwyse_Commerce/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An enterprise-grade, AI-powered EdTech platform designed for commerce students in Class 11, Class 12, and CUET Commerce exam preparation in India. Features intelligent adaptive learning, comprehensive mock tests, and professional deployment support.

## 📚 Documentation

We have consolidated our documentation into two main guides:

- **[🛠️ Development Guide](./DEVELOPMENT.md)**: Architecture, design system, contributing guidelines, testing, and project status.
- **[🚀 Deployment Guide](./DEPLOYMENT.md)**: Deployment strategies, Docker setup, CI/CD, security, and readiness checklists.

## 🚀 Quick Start

Get PrepWyse Commerce running on your local machine in 5 minutes!

### Prerequisites

- Node.js 18+ installed ([Download](https://nodejs.org/))
- PostgreSQL database (local or cloud)
- Clerk account ([Sign up free](https://clerk.com))

### Step 1: Clone and Install

```bash
git clone https://github.com/aipankajsinghal/Prepwyse_Commerce.git
cd Prepwyse_Commerce
npm install
```

### Step 2: Set Up Environment

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Update `.env` with your credentials:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk Publishable Key
   - `CLERK_SECRET_KEY`: Your Clerk Secret Key
   - `CLERK_WEBHOOK_SECRET`: Your Clerk Webhook Secret (see [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md))
   - `OPENAI_API_KEY`: Your OpenAI API Key (for AI features)

### Step 3: Database Setup

```bash
# Run migrations
npx prisma migrate dev

# Seed database (optional)
npm run seed
```

### Step 4: Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## ✨ Features

### 🤖 AI-Powered Learning

- **AI-Generated Quizzes**: OpenAI GPT-4 generates contextual questions tailored to selected chapters
- **Adaptive Difficulty**: Automatic difficulty adjustment based on last 10 quiz performances
- **Adaptive Learning Paths**: ML-based personalized learning journeys with performance pattern detection
- **Automated Question Generation**: Bulk AI-powered question creation with quality validation
- **Personalized Recommendations**: AI analyzes performance patterns and suggests study plans
- **Smart Explanations**: Context-aware, detailed explanations for every question

### 🎓 Student Features

- **Multi-Chapter Quizzes**: Select multiple chapters across subjects for custom quizzes
- **Mock Tests**: Full-length exams matching CUET, Class 11, and Class 12 patterns
- **Performance Analytics**: Comprehensive tracking with subject-wise insights
- **User Profile**: Customizable profile with statistics and achievement system
- **5 Theme Options**: Light, Dark, Ocean, Forest, Sunset with smooth transitions
- **Responsive Design**: Optimized for mobile, tablet, and desktop

### 👨‍💼 Admin Panel

- **User Management**: View, search, edit, and manage users
- **Content Management**: Organize subjects, chapters, and questions
- **Analytics Dashboard**: Key metrics and platform statistics
- **Role-Based Access**: Secure admin-only functionality

## 🤝 Contributing

We welcome contributions! Please see the [Development Guide](./DEVELOPMENT.md) for details on our code style, architecture, and how to submit pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
