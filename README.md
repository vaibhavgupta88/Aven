<div align="center">

# AVEN AI ⚡

### Production-Grade AI Content Studio & Primitives

[![Last Commit](https://img.shields.io/github/last-commit/vaibhavgupta88/Aven?style=flat-square&color=FF4D5E)](https://github.com/vaibhavgupta88/Aven)
[![Repository](https://img.shields.io/badge/GitHub-vaibhavgupta88%2FAven-181717?style=flat-square&logo=github)](https://github.com/vaibhavgupta88/Aven)
[![License](https://img.shields.io/badge/license-ISC-blue?style=flat-square)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-success?style=flat-square)]()

*Powered by modern full-stack primitives & generative AI:*

[![React 19](https://img.shields.io/badge/React-19.1.1-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7.1.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Express 5](https://img.shields.io/badge/Express-5.1.0-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/Neon_PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-4285F4?style=flat-square&logo=googlegemini&logoColor=white)](https://ai.google.dev)
[![Clerk](https://img.shields.io/badge/Clerk_Auth-6C47FF?style=flat-square&logo=clerk&logoColor=white)](https://clerk.com)
[![Stripe](https://img.shields.io/badge/Stripe_Payments-008CDD?style=flat-square&logo=stripe&logoColor=white)](https://stripe.com)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [AI Capabilities & Tools](#ai-capabilities--tools)
- [API Endpoints](#api-endpoints)
- [License](#license)
- [Author & Contact](#author--contact)

---

## 🌟 Overview

**Aven AI** is a production-ready, full-stack AI content generation suite and SaaS application designed for creators, marketers, and developers. Featuring an ultra-sleek dark mode interface, responsive motion animations, resilient multi-model fallback routines, and seamless Stripe payment integration, Aven AI turns text ideas into polished digital assets.

---

## ✨ Key Features

### 🤖 Generative AI Tools
- 📝 **AI Article Writer**: Writes structured, long-form articles with auto-formatted headings & conclusions powered by Google Gemini with transient rate-limit retry logic.
- 🏷️ **Blog Title Generator**: Produces 5 high-converting, punchy blog headlines tailored by keyword and niche category.
- 🎨 **AI Image Studio**: Converts text prompts into photorealistic visuals via Clipdrop API, complete with community publishing options.
- 🖼️ **Background Eraser**: Instant background isolation using Cloudinary AI transformations.
- ✂️ **Object Removal**: Generative object erasing specified by plain text prompts.
- 📄 **ATS Resume Scanner**: Parses PDF resumes with `pdf-parse` and delivers detailed ATS scores, strengths, weaknesses, and recommendations.

### 💳 SaaS & User Experience
- 🔐 **Clerk Authentication**: Passwordless & social authentication with instant session JWT verification.
- 📊 **Interactive Dashboard**: Real-time overview of user creations, usage limits, and active subscription status.
- 🌐 **Community Gallery**: Public showcase featuring optimistic like toggles, hover overlays, and instant file downloads (`.png` / `.txt`).
- 💰 **Stripe Integration**: Supports Free Starter (10 credits) and Pro Creator ($19/mo) plans with test-mode bypass and live Stripe Webhooks.
- 🌓 **Theme Provider**: Sleek Dark/Light mode switcher persisted in local storage.

---

## 🛠️ Tech Stack

### Frontend (`client/`)
- **React 19** & **Vite 7**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Lucide React** icons
- **React Router DOM v7**
- **Clerk React SDK** (`@clerk/clerk-react`)
- **Axios** & **React Hot Toast**
- **React Markdown**

### Backend (`server/`)
- **Node.js** & **Express 5**
- **Neon Serverless PostgreSQL** (`@neondatabase/serverless`)
- **Google Gemini API** (via OpenAI SDK compatibility with model fallback)
- **Clipdrop API** & **Cloudinary AI SDK**
- **Stripe Node SDK**
- **Multer** & **PDF-Parse**
- **Clerk Express SDK** (`@clerk/express`)

---

## 📁 Architecture

```
Aven/
├── client/                     # React 19 + Vite Frontend
│   ├── src/
│   │   ├── assets/            # Graphics & SVG icons
│   │   ├── components/        # Reusable UI components
│   │   │   ├── AiTools.jsx
│   │   │   ├── CreationItem.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Plan.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Testimonial.jsx
│   │   ├── context/
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/             # Application route views
│   │   │   ├── BlogTitles.jsx
│   │   │   ├── Community.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── GenerateImages.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── PaymentSuccess.jsx
│   │   │   ├── RemoveBackground.jsx
│   │   │   ├── RemoveObject.jsx
│   │   │   ├── ReviewResume.jsx
│   │   │   └── WriteArticle.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
└── server/                    # Express 5 Backend
    ├── configs/               # Service configurations
    │   ├── cloudinary.js
    │   ├── db.js
    │   └── multer.js
    ├── controllers/           # Controllers
    │   ├── aiController.js
    │   ├── stripeController.js
    │   └── userController.js
    ├── middlewares/           # Auth middleware
    │   └── auth.js
    ├── routes/                # API routes
    │   ├── aiRoutes.js
    │   ├── stripeRoutes.js
    │   └── userRoutes.js
    ├── server.js              # Entry point
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- Account keys for:
  - [Google Gemini API](https://aistudio.google.com/)
  - [Clerk Auth](https://clerk.com)
  - [Neon PostgreSQL](https://neon.tech)
  - [Cloudinary](https://cloudinary.com)
  - [Clipdrop API](https://clipdrop.co/apis) *(Optional for Image Studio)*
  - [Stripe Account](https://stripe.com) *(Optional for Billing)*

### Installation

1. **Clone the Repository:**
```bash
git clone https://github.com/vaibhavgupta88/Aven.git
cd Aven
```

2. **Install Backend Dependencies:**
```bash
cd server
npm install
```

3. **Install Frontend Dependencies:**
```bash
cd ../client
npm install
```

---

### Environment Variables

Create `.env` files in both `server/` and `client/` directories:

#### **`server/.env`**
```env
PORT=3000
DATABASE_URL=postgresql://user:password@ep-sample-123456.neon.tech/neondb?sslmode=require
GEMINI_API_KEY=AIzaSy...
CLIPDROP_API_KEY=...
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=http://localhost:5173
```

#### **`client/.env`**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_BASE_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

### Running Locally

Launch both services simultaneously:

**Start Backend API Server (Port 3000):**
```bash
cd server
npm start
```

**Start Frontend Development Server (Port 5173 / 5174):**
```bash
cd client
npm run dev
```

Visit [`http://localhost:5173`](http://localhost:5173) in your browser!

---

## 📡 API Endpoints

### AI Service (`/api/ai`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/generate-article` | Generates full-length markdown articles | Yes |
| `POST` | `/generate-blog-title` | Generates 5 catchy blog post headlines | Yes |
| `POST` | `/generate-image` | Creates text-to-image art via Clipdrop & Cloudinary | Yes |
| `POST` | `/remove-image-background` | Removes background from uploaded image file | Yes |
| `POST` | `/remove-image-object` | Erases specified object from uploaded image file | Yes |
| `POST` | `/resume-review` | Parses & scores PDF resume with ATS breakdown | Yes |

### User & Community Service (`/api/user`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/get-user-creations` | Fetches history of current user's creations | Yes |
| `GET` | `/get-published-creations` | Fetches public community artwork gallery | Yes |
| `GET` | `/get-user-data` | Fetches active subscription plan & credit usage | Yes |
| `POST` | `/toggle-like-creation` | Likes/unlikes a community creation item | Yes |
| `POST` | `/delete-creation` | Deletes creation item by ID | Yes |

### Billing & Stripe (`/api/stripe`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/create-checkout-session` | Initializes Stripe checkout session for plan upgrade | Yes |
| `POST` | `/webhook` | Handles raw Stripe event webhooks | Raw |

---

## 📄 License

Distributed under the ISC License.

---

## 👤 Author & Contact

**Vaibhav Gupta**  
- **GitHub:** [@vaibhavgupta88](https://github.com/vaibhavgupta88)  
- **Repository:** [vaibhavgupta88/Aven](https://github.com/vaibhavgupta88/Aven)

<div align="center">
  <sub>Built with ❤️ by Vaibhav Gupta</sub>
</div>
