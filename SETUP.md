run frontend -
cd frontend/
npm run dev

run backend -
cd backend/
venv/bin/python -m uvicorn app.main:app --reload --port 8000

https://smarthire-jobs.netlify.app/

https://app.netlify.com/projects/smarthire-jobs/overview

https://dashboard.render.com/web/srv-d9lhp2vlk1mc738q4etg/deploys/dep-d9ljaj617qgc73av58q0?r=2026-07-30%4011%3A27%3A13%7E2026-07-30%4011%3A30%3A01

https://supabase.com/dashboard/project/urvcskhtvcseerltfaee

DATABASE_URL=postgresql+asyncpg://postgres:Happy%40013Aditya@db.urvcskhtvcseerltfaee.supabase.co:5432/postgres?ssl=require


1. How to check if your database has changes
From the backend folder:
python -m alembic check
Result:
If you see:
No new upgrade operations detected.
→ ✅ No schema changes. Nothing to do.

2. If there are changes, what to do?
Create a migration:
python -m alembic revision --autogenerate -m "describe your change"
Then review the generated file in:
backend/alembic/versions/
Apply it to your local PostgreSQL:
python -m alembic upgrade head

Then commit and push the migration file:
git add .
git commit -m "update database schema"
git push origin main
