# FAT GYM - Management Platform 🏋️‍♂️

A Premium Gym Management Platform featuring an Interactive Dashboard, Member Management, Inventory Tracking, Trainer Scheduling, and Complaint Handling.

## 🚀 Local Development Setup

To ensure the application runs correctly on your local machine, please ensure you have **Node.js 18.17 or later** installed. Follow these steps:

### 1. Clone the Repository
```bash
git clone https://github.com/Komsunyamwong-got/fatgym-platform.git
cd fatgym-platform
```

### 2. Install Dependencies
Navigate to the project directory and run:
```bash
npm install
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Configure Environment Variables
Copy the example environment file to create your own `.env` file:
```bash
cp .env.example .env
```

### 5. Initialize Database & Seed Data
This step creates the local SQLite database and populates it with sample records (e.g., Coach Mike, John Doe) so you can test the platform immediately:
```bash
npx prisma db push
npx prisma db seed
```

### 6. Start the Application
```bash
npm run dev
```
Open your browser and navigate to: [http://localhost:3000](http://localhost:3000)

---

## 🛠 Key Features to Test
- **Interactive Dashboard**: Real-time overview of gym operations and system alerts.
- **Global Search (⌘K)**: Instant search across all modules (Try searching for "Mike").
- **Member Management**: Streamlined member registration and status tracking.
- **Inventory System**: Automated stock monitoring and low-stock alerts.
- **Complaints Module**: Centralized feedback and issue resolution workflow.

---
**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma, and SQLite for easy local setup without external database dependencies.
