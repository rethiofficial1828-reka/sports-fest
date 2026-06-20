const fs = require("fs");
const content = `# Sports Fest Project Summary

## 1. Project Overview
**Sports Fest Platform** is a web-based, multi-role portal for colleges to organize, discover, and join sporting events. 
- **Admins** manage colleges, moderate reports, and ban users.
- **Organizers** create sports events, track participants, and approve team sign-ups.
- **Students** browse upcoming tournaments and register.

## 2. Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Frontend:** React 19, Tailwind CSS, Lucide React
- **Backend:** Next.js Route Handlers + Edge Middleware
- **Database:** PostgreSQL (Supabase) + Prisma ORM
- **Authentication:** Custom JWT-based (jose library)
- **Deployment target:** Vercel

## 3. Architecture
The project strictly separates concerns into clean folders:
- \`backend/\`: API route handler logic (\`api/\`), ORM schema (\`prisma/\`), database services (\`lib/services/\`), and auth utilities (\`lib/auth/\`).
- \`frontend/\`: UI components, separated by role (\`admin/\`, \`organizer/\`, \`student/\`, and \`shared/\`).
- \`app/\`: Next.js entrypoints acting solely as thin proxy routes to connect the \`frontend/\` UI and \`backend/\` logic.
- \`middleware.ts\`: Secures routes centrally at the Edge.

## 4. Key Data Models
- **User:** Stores accounts with a \`Role\` enum (student, organizer, admin).
- **Event:** Represents a sports tournament created by an Organizer.
- **Registration:** Links a Student to an Event.
- **College:** An institution verified by an Admin.

## 5. Security & Authentication
- Stateless JWT tokens track the active user's ID and Role.
- \`middleware.ts\` intercepts requests, decoding the JWT to prevent Students from hitting \`/admin\` routes, and vice versa.
- All mutating API calls (POST/PUT/DELETE) validate x-csrf-token.

## 6. How to Run Locally
1. \`git clone [repo_url]\` & \`npm install\`
2. Configure \`.env.local\` with \`DATABASE_URL\` and \`JWT_SECRET\`
3. Push schema: \`npx prisma db push\`
4. Start server: \`npm run dev\`
5. Visit \`http://localhost:3000\`
`;
fs.writeFileSync("PROJECT_SUMMARY.md", content, "utf8");
