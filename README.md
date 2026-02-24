# 🛡️ Warranty Vault

> **Never lose a bill or warranty again.** Store, organize, and track all your purchase bills and warranties in one secure digital vault — with smart email reminders before they expire.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss)
![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk)
![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel)

---

## ✨ Features

- 🔐 **Secure Authentication** — Sign up/in with Clerk (email/password + OAuth)
- 📸 **OCR Bill Scanning** — Upload a photo and auto-extract bill details with Tesseract.js
- 📋 **Organized Dashboard** — Search, filter, and sort all your bills in one place
- ⏰ **Smart Reminders** — Get email notifications before warranties expire (user-configurable timing)
- 🖼️ **Image Storage** — Bill photos stored securely in Supabase Storage
- 🛡️ **Row-Level Security** — Your data is private, enforced at the database level
- 📱 **Fully Responsive** — Works beautifully on desktop, tablet, and mobile
- 🎨 **Premium Dark UI** — Deep navy + gold accent design system

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Styling** | Tailwind CSS v4 |
| **Auth** | Clerk |
| **Database** | Supabase (PostgreSQL) |
| **Storage** | Supabase Storage |
| **OCR** | Tesseract.js (client-side) |
| **Email** | Resend |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Hosting** | Vercel |
| **Cron** | Vercel Cron |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                          # Landing page
│   ├── layout.tsx                        # Root layout + Clerk provider
│   ├── globals.css                       # Design system + Tailwind
│   ├── sign-in/[[...sign-in]]/page.tsx   # Clerk sign-in
│   ├── sign-up/[[...sign-up]]/page.tsx   # Clerk sign-up
│   ├── dashboard/
│   │   ├── layout.tsx                    # Dashboard nav + layout
│   │   ├── page.tsx                      # Bills overview + stats
│   │   ├── bills/
│   │   │   ├── new/page.tsx              # Add bill (OCR + manual)
│   │   │   ├── [id]/page.tsx             # Bill details
│   │   │   └── [id]/edit/page.tsx        # Edit bill
│   │   └── settings/page.tsx             # Notification settings
│   └── api/
│       ├── cron/check-warranties/route.ts  # Daily warranty check
│       └── webhooks/clerk/route.ts         # Clerk user sync
├── lib/
│   ├── supabase/client.ts                # Browser Supabase client
│   ├── supabase/server.ts                # Server Supabase client (admin)
│   ├── ocr/index.ts                      # OCR abstraction layer
│   ├── ocr/tesseract.ts                  # Tesseract.js implementation
│   ├── email/resend.ts                   # Email sending via Resend
│   ├── types.ts                          # TypeScript types
│   └── utils.ts                          # Shared utilities
├── middleware.ts                          # Clerk auth middleware
supabase/
└── migrations/001_initial_schema.sql     # Database schema + RLS
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm
- Accounts on: [Clerk](https://clerk.com), [Supabase](https://supabase.com), [Resend](https://resend.com) (all free tier)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/Personal-Bill-Vault.git
cd Personal-Bill-Vault
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in your keys:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | [Clerk Dashboard](https://dashboard.clerk.com) → API Keys |
| `CLERK_SECRET_KEY` | Same as above |
| `NEXT_PUBLIC_SUPABASE_URL` | [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same as above |
| `SUPABASE_SERVICE_ROLE_KEY` | Same as above (⚠️ keep this secret!) |
| `RESEND_API_KEY` | [Resend Dashboard](https://resend.com/api-keys) → Create API Key |
| `CRON_SECRET` | Generate any random string (used to secure the cron endpoint) |

### 3. Set Up Supabase Database

1. Go to your Supabase project → **SQL Editor**
2. Paste and run the contents of `supabase/migrations/001_initial_schema.sql`
3. Go to **Storage** → Create a new bucket named `bill-images` (set to **Public**)
4. Add storage policies as documented in the SQL file comments

### 4. Set Up Clerk Webhook

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → **Webhooks**
2. Add a new endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Subscribe to events: `user.created`, `user.updated`, `user.deleted`
4. For local development, use [ngrok](https://ngrok.com) to create a public tunnel

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🚀

---

## 📦 Deployment (Vercel)

1. Push your code to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local` to Vercel's Environment Variables
4. Deploy!
5. Update the Clerk webhook URL to your Vercel domain
6. The daily cron job is configured in `vercel.json` (runs at 8:00 AM UTC)

---

## 🗄️ Database Schema

| Table | Purpose |
|---|---|
| `users` | Synced from Clerk — stores user id & email |
| `bills` | All purchase/warranty records with soft delete |
| `notification_settings` | Per-user reminder timing preferences |
| `notification_log` | Tracks sent email notifications |

All tables have **Row-Level Security (RLS)** enabled — users can only access their own data.

---

## 🎨 Design System

| Token | Color | Use |
|---|---|---|
| `bg-main` | `#050816` | Page background |
| `bg-surface` | `#0F172A` | Cards, navbar |
| `primary` | `#3B82F6` | Buttons, links |
| `accent` | `#D4A574` | Gold highlights, premium feel |
| `success` | `#22C55E` | Active warranty |
| `warning` | `#FACC15` | Expiring soon |
| `danger` | `#EF4444` | Expired |

---

## 📋 TODO / Future Improvements

- [ ] Multi-image support per bill (invoice + warranty card)
- [ ] CSV/PDF export of all bills
- [ ] Analytics dashboard (spend by category, monthly trends)
- [ ] Multi-language support (i18n)
- [ ] Progressive Web App (PWA) for mobile install
- [ ] Share warranty info with family members

---

## 📄 License

MIT © Warranty Vault

---

Built with ❤️ using Next.js, Clerk, Supabase, and Resend.
