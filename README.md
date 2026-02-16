# MyUserJourney - AI-Powered Digital Analytics Platform

**MyUserJourney** is a self-hosted, AI-powered analytics and CMS platform designed for comprehensive user behaviour tracking, SEO analysis, PPC campaign management, and content management. It provides a GA4-style navigation experience while being fully compliant with UK GDPR, UK PECR, EU GDPR, and EU ePrivacy Directives.

Live at: [https://myuserjourney.co.uk](https://myuserjourney.co.uk)

### The Problem

Businesses today face an impossible choice: use powerful analytics platforms that compromise user privacy and send data to third-party servers, or use privacy-focused alternatives that lack advanced features. Google Analytics 4 raises GDPR adequacy concerns with cross-border data transfers. Microsoft Clarity records sessions without granular consent. Amplitude and Mixpanel charge premium prices that exclude SMEs. None of them offer integrated AI insights, CMS, SEO auditing, and PPC management in a single self-hosted solution.

### The Innovation

MyUserJourney eliminates this trade-off by combining enterprise-grade analytics with AI-powered intelligence and full privacy compliance in a single, self-hosted platform. It is the first open-source solution to unify real-time behavioural analytics, predictive AI (churn risk, revenue forecasting, conversion predictions), automated UX auditing, natural language analytics queries, SEO site auditing, PPC campaign management, and a complete CMS — all while maintaining GDPR/PECR compliance by design, not as an afterthought.

### Documentation

| Document | Description |
|----------|-------------|
| [Whitepaper](whitepaper.md) | Technical architecture, innovation approach, competitive analysis |
| [Impact Narrative](docs/IMPACT_NARRATIVE.md) | Global impact and real-world problem solving |
| [Leadership Proof](docs/LEADERSHIP_PROOF.md) | Product leadership and innovation ownership |
| [Global Relevance](docs/GLOBAL_RELEVANCE.md) | Worldwide applicability and market potential |
| [Innovation Statement](docs/INNOVATION_STATEMENT.md) | Competitive positioning and differentiation |
| [Visual Evidence Guide](docs/VISUAL_EVIDENCE_GUIDE.md) | Screenshot and evidence collection checklist |

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Google OAuth Setup](#google-oauth-setup)
- [SMTP Configuration](#smtp-configuration)
- [Running Locally](#running-locally)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [Admin Panel](#admin-panel)
- [Architecture Overview](#architecture-overview)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Analytics Engine
- **Real-time Dashboard** - Active users, per-minute activity charts, top content
- **Acquisition Analytics** - Traffic source breakdown, referrer analysis, campaign tracking
- **Engagement Metrics** - Event types, pages, landing pages, session duration
- **Live Event Stream** - Real-time event feed with multi-dimensional filtering
- **User Journey Replay** - Session reconstruction and timeline views
- **Visitor Profiles** - Aggregated visitor data with export capabilities
- **Traffic Source Classification** - Organic, social, paid, referral, email, display, affiliate, direct
- **Geography Analytics** - Country, city, and language distribution
- **Browser & Device Analytics** - Browser, OS, and device type breakdowns
- **Pages Analysis** - Top pages, entry/exit pages, 404 detection
- **Funnel Builder** - No-code visual funnel builder with drag-and-drop and AI generation
- **Custom Events** - Rule-based event matching with AI-generated templates
- **Custom Reports** - Flexible report builder with AI-powered generation

### AI-Powered Features
- **AI Insights Chat** - Natural language analytics queries
- **Predictive Analytics** - Churn risk scoring, revenue forecasting, conversion predictions
- **AI UX Auditor** - Automated detection of slow pages, poor UX flows, confusing navigation
- **AI Marketing Copilot** - SEO fix suggestions, PPC budget optimisation, UX recommendations

### Marketing & SEO Tools
- **Site Audit** - HTML crawling with SEO issue detection, scoring, and recommendations
- **Content Gap Analysis** - Identify missing content opportunities
- **Search Console Integration** - Google Search Console data analysis
- **PPC Campaign Management** - Campaign tracking and performance analytics
- **Site Research** - Competitive research and benchmarking

### CMS & Content Management
- **Dynamic Page Builder** - Create and manage pages via admin panel
- **File Manager** - Upload, organise, and serve files with drag-and-drop
- **Contact Form** - Built-in contact form with SMTP email notifications
- **SEO Metadata** - Per-page title, description, and meta tag management
- **Site Branding** - Customisable site name, tagline, colours, and social links

### Privacy & Compliance
- **GDPR/PECR Compliant** - Full UK and EU privacy regulation support
- **Consent Management** - Customisable consent banner with 6 categories, 3 layouts, 5 positions
- **IP Anonymisation** - Automatic last-octet anonymisation
- **Do Not Track** - Honours browser DNT headers
- **Cookieless Tracking** - Tracking without cookies or persistent identifiers
- **Right to Erasure** - One-click visitor data deletion
- **Data Portability** - Export visitor data as JSON/CSV
- **Data Retention** - Configurable retention periods with manual purge

### Authentication & Security
- **Email/Password Authentication** - Secure registration with bcrypt hashing (12 rounds)
- **Google OAuth 2.0** - Direct Google sign-in integration
- **Password Reset** - Secure token-based password reset via email
- **Role-Based Access** - Admin and user roles with route protection
- **Session Management** - PostgreSQL-backed sessions with configurable TTL

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI |
| **State Management** | TanStack React Query v5 |
| **Charts** | Recharts |
| **Routing** | Wouter |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL |
| **ORM** | Drizzle ORM |
| **Authentication** | Passport.js (Local + Google OAuth 2.0) |
| **Email** | Nodemailer |
| **AI** | OpenAI API (GPT-4o-mini, configurable provider) |
| **Payments** | Stripe (automated invoicing) |
| **File Uploads** | Multer |

---

## Project Structure

```
myuserjourney/
├── client/                    # Frontend React application
│   └── src/
│       ├── components/        # Reusable UI components
│       │   └── ui/            # Shadcn UI components
│       ├── hooks/             # Custom React hooks
│       ├── lib/               # Utility functions & API client
│       └── pages/             # Route page components
│           └── public/        # Public-facing pages
├── server/                    # Backend Express application
│   ├── auth.ts                # Authentication (Passport.js, OAuth, password reset)
│   ├── routes.ts              # API route handlers
│   ├── storage.ts             # Database access layer (CRUD operations)
│   ├── ai-service.ts          # AI/LLM integration service
│   ├── db.ts                  # Database connection
│   ├── index.ts               # Server entry point
│   ├── seed.ts                # Database seed data
│   └── vite.ts                # Vite dev server integration
├── shared/
│   └── schema.ts              # Drizzle ORM schema (27 tables) + Zod validators
├── uploads/                   # User-uploaded files (gitignored)
├── .env.example               # Environment variable template
├── .gitignore                 # Git ignore rules
├── drizzle.config.ts          # Drizzle ORM configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── vite.config.ts             # Vite build configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies and scripts
├── LICENSE                    # MIT License
├── README.md                  # This file
└── whitepaper.md              # Technical whitepaper
```

---

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **PostgreSQL** >= 14.x
- A **Google Cloud Console** project (for OAuth, optional)
- An **SMTP server** (for email notifications, optional)
- An **OpenAI API key** (for AI features, optional)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/myuserjourney.git
cd myuserjourney
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your actual values. See [Environment Variables](#environment-variables) for details.

### 4. Set Up the Database

Ensure PostgreSQL is running, then push the schema:

```bash
npm run db:push
```

This creates all 27 tables defined in `shared/schema.ts`.

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Secret key for session encryption (use a strong random string) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth 2.0 Client Secret |
| `OPENAI_API_KEY` | No | OpenAI API key for AI features |
| `OPENAI_API_BASE_URL` | No | OpenAI API base URL (default: `https://api.openai.com/v1`) |
| `STRIPE_SECRET_KEY` | No | Stripe secret key for payment processing |
| `STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key |
| `STRIPE_WEBHOOK_DOMAIN` | No | Domain for Stripe webhook endpoint (e.g., `https://yourdomain.com`) |
| `ADMIN_EMAIL` | No | Email address to auto-promote to admin on startup (recommended for first-time setup) |
| `ADMIN_DEFAULT_PASSWORD` | No | Password for seeded admin account (`admin@analytics.io`). Min 8 chars. Required only for initial setup. |
| `NODE_ENV` | No | `development` or `production` (default: `development`) |
| `PORT` | No | Server port (default: `5000`) |

Generate a secure session secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Database Setup

### Local PostgreSQL

1. Install PostgreSQL 14+
2. Create a database:

```sql
CREATE DATABASE myuserjourney;
CREATE USER myuser WITH ENCRYPTED PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE myuserjourney TO myuser;
```

3. Set `DATABASE_URL` in your `.env`:

```
DATABASE_URL=postgresql://myuser:yourpassword@localhost:5432/myuserjourney
```

4. Push the schema:

```bash
npm run db:push
```

### Database Schema

The platform uses 27 PostgreSQL tables managed by Drizzle ORM:

- `users` - User accounts with role-based access
- `password_resets` - Secure password reset tokens
- `projects` - Analytics project configurations
- `events` - Tracked analytics events
- `funnels` - Conversion funnel definitions
- `seo_analyses` - SEO audit results
- `ppc_campaigns` - PPC campaign data
- `custom_reports` - User-defined reports
- `consent_settings` / `consent_records` - GDPR consent management
- `site_settings` / `cms_pages` / `cms_files` - CMS content
- `smtp_settings` - Email configuration
- `contact_submissions` - Contact form entries
- And more (see `shared/schema.ts` for the complete schema)

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client IDs**
5. Set application type to **Web application**
6. Add **Authorised JavaScript origins**:
   - `https://yourdomain.com`
   - `http://localhost:5000` (for development)
7. Add **Authorised redirect URIs**:
   - `https://yourdomain.com/api/auth/google/callback`
   - `http://localhost:5000/api/auth/google/callback` (for development)
8. Copy the **Client ID** and **Client Secret** into your `.env` file

---

## SMTP Configuration

SMTP is configured through the Admin Panel at runtime (no environment variables required):

1. Log in as an admin user
2. Navigate to **Admin Panel** > **SMTP Configuration** tab
3. Enter your SMTP server details:
   - Host (e.g., `smtp.gmail.com`)
   - Port (e.g., `587` for TLS, `465` for SSL)
   - Username and password
   - From name and email address
   - Encryption type (TLS/SSL/None)
4. Click **Test Email** to verify the configuration
5. Enable SMTP by toggling it active

SMTP is used for:
- Contact form email notifications
- Password reset emails
- System notifications

---

## Running Locally

### Development Mode

```bash
npm run dev
```

This starts both the Express backend and Vite frontend dev server on port 5000 with hot module replacement.

### Type Checking

```bash
npm run check
```

---

## Building for Production

### Build

```bash
npm run build
```

This compiles TypeScript and bundles the frontend with Vite.

### Start Production Server

```bash
npm start
```

The production server serves the built frontend as static files.

---

## Deployment

### Custom Domain Setup

1. Build the application: `npm run build`
2. Deploy to your server (VPS, cloud provider, or PaaS)
3. Set `NODE_ENV=production` in your environment
4. Configure your reverse proxy (nginx/Apache) to forward to port 5000
5. Set up SSL certificates (e.g., via Let's Encrypt)
6. Point your domain's DNS records to your server

### Example nginx Configuration

```nginx
server {
    listen 443 ssl;
    server_name myuserjourney.co.uk;

    ssl_certificate /etc/letsencrypt/live/myuserjourney.co.uk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/myuserjourney.co.uk/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Cloud Deployment Options

The application can be deployed to any platform that supports Node.js and PostgreSQL:

- **Railway** - Connect GitHub repo for automatic deploys
- **Render** - Free tier available with managed PostgreSQL
- **DigitalOcean App Platform** - Scalable deployment
- **AWS EC2 / Lightsail** - Full control over infrastructure
- **Heroku** - Quick deployment with add-on PostgreSQL

---

## Admin Panel

Access the admin panel at `/admin` (requires admin role).

### Tabs

| Tab | Description |
|-----|-------------|
| **Site Settings** | Configure site name, tagline, brand colours, social media links |
| **SMTP Configuration** | Set up email server with test functionality |
| **CMS Pages** | Create, edit, publish/unpublish pages with SEO metadata |
| **File Manager** | Upload and manage files with drag-and-drop interface |
| **User Management** | View users, change roles, activate/deactivate accounts |
| **Contact Submissions** | Review contact form entries, update status, delete |

### Creating Your First Admin Account

**Option A: Auto-promote via ADMIN_EMAIL (recommended)**

Set `ADMIN_EMAIL` in your `.env` file:

```
ADMIN_EMAIL=your@email.com
```

Register an account with that email address. On each app startup, the user matching `ADMIN_EMAIL` is automatically promoted to admin. This is the easiest method and requires no database access.

**Option B: Seed admin account**

Set `ADMIN_DEFAULT_PASSWORD` in your `.env` file before first run:

```
ADMIN_DEFAULT_PASSWORD=your-strong-password-here
```

On first startup, a default admin account is created:
- Email: `admin@analytics.io`
- Password: value of `ADMIN_DEFAULT_PASSWORD`

Change this password immediately after first login.

**Option C: Promote via SQL**

1. Register a new account via the login page
2. Promote the user to admin via SQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

3. Or use the admin panel's User Management tab if you already have admin access

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│  React 18 + TypeScript + Tailwind CSS + Shadcn UI       │
│  TanStack Query for state | Wouter for routing          │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/HTTPS
┌──────────────────────▼──────────────────────────────────┐
│                  Express.js Server                       │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐    │
│  │   Auth   │  │  Routes  │  │   AI Service       │    │
│  │ Passport │  │  REST    │  │   OpenAI API       │    │
│  └──────────┘  └──────────┘  └────────────────────┘    │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Storage Layer (CRUD)                │    │
│  │         Type-safe Drizzle ORM queries            │    │
│  └──────────────────────┬──────────────────────────┘    │
└─────────────────────────┼───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│              PostgreSQL Database                         │
│           27 tables, managed by Drizzle ORM              │
└─────────────────────────────────────────────────────────┘
```

For a detailed technical deep-dive, see [whitepaper.md](whitepaper.md).

---

## API Reference

All API endpoints return JSON. Authenticated endpoints require a valid session cookie (set automatically after login).

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new account | No |
| POST | `/api/auth/login` | Email/password login | No |
| GET | `/api/auth/google` | Initiate Google OAuth | No |
| GET | `/api/auth/google/callback` | Google OAuth callback | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/logout` | Log out | Yes |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password with token | No |

**Example: Register**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securepass123", "firstName": "John", "lastName": "Doe"}'
```

**Example: Login**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securepass123"}'
```

Response:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "user",
  "role": "user",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Analytics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/events` | Collect tracking event | No (uses project ID) |
| GET | `/api/projects/:id/stats` | Dashboard statistics | Yes |
| GET | `/api/projects/:id/realtime` | Real-time analytics | Yes |
| GET | `/api/projects/:id/acquisition` | Acquisition data | Yes |
| GET | `/api/projects/:id/engagement` | Engagement metrics | Yes |
| GET | `/api/projects/:id/visitors` | Visitor list | Yes |
| GET | `/api/projects/:id/events` | Event stream | Yes |

**Example: Collect Event**

```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "your-project-id",
    "eventType": "pageview",
    "page": "/pricing",
    "referrer": "https://google.com",
    "visitorId": "visitor-123",
    "sessionId": "session-456"
  }'
```

### CMS (Public - No Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/site-settings` | Site branding and settings |
| GET | `/api/public/pages` | List published CMS pages |
| GET | `/api/public/pages/:slug` | Get single page by slug |
| POST | `/api/public/contact` | Submit contact form |

**Example: Submit Contact Form**

```bash
curl -X POST http://localhost:5000/api/public/contact \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe", "email": "jane@example.com", "message": "Hello!"}'
```

### Admin (Requires Admin Role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PUT | `/api/admin/site-settings` | Manage site settings |
| GET/PUT | `/api/admin/smtp` | Manage SMTP configuration |
| POST | `/api/admin/smtp/test` | Send test email |
| GET/POST/PUT/DELETE | `/api/admin/pages` | Manage CMS pages |
| GET/POST/DELETE | `/api/admin/files` | Manage uploaded files |
| GET/PUT/DELETE | `/api/admin/users` | Manage user accounts |
| GET/PUT/DELETE | `/api/admin/contacts` | Manage contact submissions |

### Projects

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/projects` | List user's projects | Yes |
| POST | `/api/projects` | Create new project | Yes |
| GET | `/api/projects/:id` | Get project details | Yes |
| PUT | `/api/projects/:id` | Update project | Yes |
| DELETE | `/api/projects/:id` | Delete project | Yes |

### AI Features

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/projects/:id/ai/chat` | AI analytics chat | Yes |
| POST | `/api/projects/:id/ai/predict` | Predictive analytics | Yes |
| POST | `/api/projects/:id/ai/ux-audit` | AI UX audit | Yes |
| POST | `/api/projects/:id/ai/marketing` | AI marketing copilot | Yes |

---

## Security Notes

- **Session Secret**: The `SESSION_SECRET` environment variable is required for production. A fallback value is used in development only. Always set a strong, unique value for production deployments.
- **Admin Account**: The seed admin account requires `ADMIN_DEFAULT_PASSWORD` to be set. If not set, no default admin is created. Always change the admin password after first login.
- **HTTPS**: In production (`NODE_ENV=production`), cookies are set with the `secure` flag, requiring HTTPS. Always deploy behind an SSL-terminating reverse proxy.
- **Password Hashing**: All passwords are hashed with bcrypt using 12 salt rounds (exceeds OWASP minimum).
- **Input Validation**: All API inputs are validated with Zod schemas before processing.

---

## Traction and Validation

| Metric | Status |
|--------|--------|
| **GitHub Stars** | Tracking adoption and community interest |
| **Live Deployment** | Production at [myuserjourney.co.uk](https://myuserjourney.co.uk) with SSL |
| **Users Onboarded** | Active admin and user accounts in production |
| **Beta Testing** | Internal testing across analytics, CMS, AI, and compliance features |
| **Database Architecture** | 27 production tables with full relational integrity |
| **API Endpoints** | 50+ RESTful endpoints covering analytics, CMS, AI, privacy, and admin |
| **GDPR Compliance** | Full UK GDPR, UK PECR, EU GDPR, and EU ePrivacy Directive compliance |
| **AI Features Shipped** | Predictive analytics, UX auditor, marketing copilot, NLP insights |
| **Performance** | Sub-second API response times, real-time event processing, optimised PostgreSQL queries |
| **Code Quality** | End-to-end TypeScript, Zod validation, Drizzle ORM type safety, bcrypt authentication |

---

## Evidence Portfolio

Supporting evidence for the platform's capabilities is organised in the [`evidence/`](evidence/) directory:

```
evidence/
  screenshots/       Platform UI screenshots (dashboard, AI, admin, privacy)
  whitepaper/         Exported whitepaper and technical documents (PDF)
  architecture/      System diagrams, schema visuals, data flow charts
  demo-videos/       Screen recordings of platform functionality
```

Refer to the [Visual Evidence Guide](docs/VISUAL_EVIDENCE_GUIDE.md) for a detailed checklist of what to capture and how to present each item.

---

## Future Roadmap

| Phase | Timeline | Features |
|-------|----------|----------|
| **v1.1** | Q2 2026 | Heatmaps, scroll depth tracking, A/B testing framework |
| **v1.2** | Q3 2026 | Multi-tenant SaaS mode, team collaboration, role-based dashboards |
| **v1.3** | Q4 2026 | Real-time alerting engine, anomaly detection, webhook integrations |
| **v2.0** | Q1 2027 | Mobile SDK (iOS/Android), server-side tracking, data warehouse connectors |
| **v2.1** | Q2 2027 | White-label reseller programme, API marketplace, plugin architecture |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please ensure your code follows the existing style conventions and includes appropriate TypeScript types.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with purpose by the MyUserJourney team.
