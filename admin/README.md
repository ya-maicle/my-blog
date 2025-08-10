Admin Panel

Local dev
1) Copy .env.example to .env.local and fill secrets.
2) Ensure Google OAuth console has http://localhost:3002/api/auth/callback/google as an authorized redirect URI.
3) Run: npm install
4) Start: npm run dev

Notes
- Shares the same database as the frontend (DATABASE_URL points to ../frontend/prisma/dev.db for SQLite).
- Uses NextAuth with JWT sessions and embeds user.role into the token/session for RBAC.
- Middleware protects /dashboard, /users, and /api/admin/* to ADMIN-only.
