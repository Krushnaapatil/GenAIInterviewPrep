# Gen AI Interview Preparation Web Application

A production-ready, full-stack web application for AI-powered job interview preparation. Users can upload resumes, analyze job descriptions, detect skill gaps, and generate AI-driven interview questions and ATS-optimized resumes. Built with React, Node.js, Express, MongoDB, JWT, Gemini AI, and Puppeteer.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [How It Works](#how-it-works)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview
This project simulates a real-world SaaS product for job seekers. It leverages Generative AI to:
- Parse and analyze resumes
- Compare with job descriptions
- Detect skill gaps
- Generate interview questions
- Create ATS-optimized resumes
- Export results as PDFs

## Features
- **Secure Authentication:** JWT-based login, registration, and token blacklisting for logout.
- **Resume Upload & Parsing:** Users upload resumes (PDF/DOCX), which are parsed for skills and experience.
- **Job Description Analysis:** Paste or upload job descriptions to compare with your resume.
- **Skill Gap Detection:** AI highlights missing or weak skills.
- **AI Interview Questions:** Gemini AI generates tailored interview questions.
- **ATS Resume Generation:** Create resumes optimized for Applicant Tracking Systems.
- **PDF Export:** Download AI-generated resumes and reports as PDFs (via Puppeteer).
- **Recent Reports:** View and manage previous interview reports.

## Tech Stack
- **Frontend:** React.js (Vite, React Router, Context API, SCSS)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JWT, Token Blacklisting
- **AI Integration:** Gemini API (Google GenAI)
- **PDF Generation:** Puppeteer

## Architecture
- **Frontend:** SPA with protected routes, context-based state, and modular features.
- **Backend:** RESTful API, layered structure (controllers, services, models, routes, middlewares).
- **Security:** Input validation, sanitization, and secure environment variable management.

## Folder Structure
```
Backend/
  src/
    config/           # Database config
    controllers/      # API controllers
    middlewares/      # Auth, file, error handling
    models/           # Mongoose schemas
    routes/           # Express routes
    services/         # AI, business logic
  .env                # Backend environment variables
  package.json

Frontend/
  src/
    features/         # Auth, interview modules
    style/            # SCSS styles
    App.jsx           # Main app
    app.routes.jsx    # Routing
  .env                # Frontend environment variables
  package.json
```

## Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- MongoDB Atlas account
- Gemini AI API key

### 1. Clone the Repository
```sh
git clone <your-repo-url>
cd GenAiInterviewPrep
```

### 2. Backend Setup
```sh
cd Backend
cp .env.example .env # Fill in your secrets
npm install
npm run dev
```

### 3. Frontend Setup
```sh
cd ../Frontend
cp .env.example .env # Set VITE_API_URL
npm install
npm run dev
```

### 4. Access the App
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Environment Variables
- **Backend:** See `Backend/.env.example` for required variables (MongoDB URI, JWT secret, API keys).
- **Frontend:** See `Frontend/.env.example` (all variables must start with `VITE_`).

## How It Works
1. **Register/Login:** Secure JWT authentication with token blacklisting for logout.
2. **Upload Resume:** Parse and extract skills/experience.
3. **Paste Job Description:** Analyze and compare with resume.
4. **AI Skill Gap Detection:** Gemini AI highlights gaps and generates interview questions.
5. **Generate ATS Resume:** Create and download optimized resumes as PDFs.
6. **View Reports:** Manage and review previous interview reports.

## Contributing
1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Open a pull request

## License
This project is for educational purposes.