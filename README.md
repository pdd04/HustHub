# Website chia se tai lieu hoc tap

Monorepo React + Express + Prisma cho nen tang chia se tai lieu hoc tap. Phase 6 bo sung admin operations, moderation, audit log, rate limit, Docker Compose va test hardening.

## Stack

- Frontend: React + TypeScript + Vite, lucide-react
- Backend: Node.js + TypeScript + Express
- Database: MySQL
- ORM: Prisma
- Shared package: enum/type dung chung giua web va API

## Cau truc

```text
apps/
  api/      Express API, Prisma schema, auth, document, review, admin routes
  web/      Vite React frontend
packages/
  shared/   Shared response types and enums
document/   Implementation plan, phases, prototype goc
```

## Cai dat local

```bash
npm install
cp apps/api/.env.example apps/api/.env
```

Cap nhat `DATABASE_URL` trong `apps/api/.env`, sau do chay:

```bash
npm run prisma:generate
npm run prisma:migrate -w apps/api
npm run prisma:seed
npm run dev:api
npm run dev:web
```

Mac dinh:

- API: `http://localhost:3000`
- Web: `http://localhost:5173`

Neu API khong o port 3000, tao `apps/web/.env`:

```bash
VITE_API_BASE_URL=http://localhost:3000
```

## Tai khoan demo

Sau khi seed:

```text
student@veritas.local / Password123
reviewer@veritas.local / Password123
admin@veritas.local / Password123
```

- `student`: upload, comment, rating, report.
- `reviewer`: mo `/review` de approve/reject/request changes.
- `admin`: mo `/admin` de quan ly taxonomy, user role, report va audit log.

## API chinh

```text
GET  /health
GET  /api/health

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

GET  /api/documents
POST /api/documents
GET  /api/documents/:id
GET  /api/documents/filters
GET  /api/documents/upload-options
GET  /api/documents/review/queue
POST /api/documents/:id/review
POST /api/documents/:id/rating
POST /api/documents/:id/comments
POST /api/documents/:id/reports

GET    /api/personalization/dashboard
POST   /api/personalization/enrollments
DELETE /api/personalization/enrollments/:subjectId

GET    /api/admin/summary
GET    /api/admin/taxonomy
POST   /api/admin/institutions|majors|subjects|instructors|exams
PATCH  /api/admin/institutions|majors|subjects|instructors|exams/:id
DELETE /api/admin/institutions|majors|subjects|instructors|exams/:id
GET    /api/admin/users
PATCH  /api/admin/users/:id
GET    /api/admin/reports
PATCH  /api/admin/reports/:id
PATCH  /api/admin/documents/:id/visibility
GET    /api/admin/audit-logs
```

## Hardening config

`apps/api/.env.example` co cac bien van hanh:

```text
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=180
MAX_UPLOAD_FILE_BYTES=26214400
```

Upload hien validate extension/MIME cho PDF, DOC/DOCX, PPT/PPTX va TXT. Tai lieu moi vao `pending` voi badge `unverified`.

## Docker Compose

Chay web/api/mysql:

```bash
docker compose up --build
```

Container API tu chay `prisma migrate deploy` truoc khi start. Neu can nap du lieu demo trong container:

```bash
docker compose exec api npm run prisma:seed -w apps/api
```

## Kiem tra

```bash
npm run typecheck
npm run build
npm run test -w apps/api
npm run test:e2e -w apps/web
```

`test:e2e` can chay song song web/API local tai `WEB_BASE_URL` va `API_BASE_URL` mac dinh.

## Phase 6 da co

- Admin CRUD cho Institution, Major, Subject, Instructor, Exam.
- Quan ly user role/status va gan institution/major.
- Quan ly report, an/private/public tai lieu vi pham.
- Audit log cho thao tac admin quan trong.
- Rate limit, upload limit config, file validation.
- Docker Compose cho web/api/mysql.
- README local/deploy setup.
- API hardening test bang `tsx --test`.
- Frontend route-smoke e2e cho search, detail, upload, review.
