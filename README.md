# FAT GYM - Management Platform 🏋️‍♂️

A Premium Gym Management Platform featuring an Interactive Dashboard, Member Management, Inventory Tracking, Trainer Scheduling, and Complaint Handling.

---

## 🛠 Tech Stack (Cloud-Native Architecture)

This platform is built with a modern, high-performance stack for scalability and ease of use, fully optimized for serverless deployments.

- **Frontend & Backend**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/) (Radix UI based)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [Neon Serverless PostgreSQL](https://neon.tech/) (Cloud Database)
- **Deployment**: [Vercel](https://vercel.com/) (Serverless APIs & Edge Network)

---

## 🚀 Developer Handoff Manual

Welcome to the Fat Gym platform! If you are a new developer picking up this project, please follow this step-by-step guide carefully to ensure your local environment mimics our cloud architecture perfectly.

### Step 1: Clone the Repository & Install Dependencies
First, clone the code to your local machine and install all required Node.js packages.
```bash
git clone https://github.com/Komsunyamwong-got/fatgym-platform.git
cd fatgym-platform
npm install
```

### Step 2: Configure Environment Variables
You MUST configure the database connection before running the project.
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Open the `.env` file and set the `DATABASE_URL` to the Neon PostgreSQL connection string provided by the project owner.
   *(Contact the lead developer/project owner if you do not have the Neon database URL).*

### Step 3: Database Setup & Prisma Client Generation
Once your `.env` is ready, synchronize your local Prisma client with the Cloud Database:
```bash
npx prisma generate
npx prisma db push
```
*(Optional)* If this is a brand new database environment and you need test data, you can seed it:
```bash
npx prisma db seed
```

### Step 4: Run the Application Locally
Start the Next.js development server:
```bash
npm run dev
```
Open your browser and navigate to: [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deployment Guide (Vercel)

We use Vercel CLI to deploy this project directly from the terminal, bypassing standard GitHub CI/CD integrations for maximum control.

**To deploy a new version to production:**
1. Ensure your local code is working correctly.
2. Open your terminal and run:
   ```bash
   npx vercel --prod
   ```
3. If it's your first time, you will be prompted to log in to Vercel via the browser.
4. Press `Enter` to accept all default prompts.
5. Once the upload is complete, Vercel will provide you with the live production URL.

> **⚠️ CRITICAL: Environment Variables on Vercel**
> The `DATABASE_URL` is NOT automatically uploaded to Vercel. You must log in to the Vercel Dashboard, go to **Settings > Environment Variables**, and manually add the `DATABASE_URL` there. If you forget this step, database queries will fail with 500 Server Errors in production.

---

## 🏗 Important Architectural Decisions

- **File Uploads (Logos & Media):** To ensure compatibility with Vercel's serverless environment, local filesystem uploads (`fs/promises`) have been deprecated. Uploaded media (like the Gym Logo) are converted to **Base64 strings** and saved directly in the `SystemSetting` table in Neon Postgres.
- **Serverless Prisma Connection:** We use the standard Prisma connection locally and in production on Vercel. We previously attempted an Edge runtime migration for Cloudflare, but the application size exceeded Cloudflare's 25MB free tier limit. **Always use Vercel** for this project.

---

## 🛠 Key Features to Test
- **Interactive Dashboard**: Real-time overview of gym operations and system alerts.
- **Global Search (⌘K)**: Instant search across all modules (Try searching for "Mike").
- **Member Management**: Streamlined member registration and status tracking.
- **Inventory System**: Automated stock monitoring and low-stock alerts.
- **Complaints Module**: Centralized feedback and issue resolution workflow.
