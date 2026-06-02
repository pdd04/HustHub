# Website chia sẻ tài liệu học tập

Phase 1 dựng nền tảng kỹ thuật và chuyển prototype `document/document-system.jsx` thành ứng dụng React TypeScript có cấu trúc.

## Stack

- Frontend: React + TypeScript + Vite, `lucide-react`
- Backend: Node.js + TypeScript + Express
- Database: MySQL
- ORM: Prisma

## Cấu trúc

```text
apps/
  api/      Backend Express, Prisma schema, health endpoint
  web/      Frontend Vite React TypeScript
packages/
  shared/   Kiểu dùng chung tối thiểu
document/  Tài liệu kế hoạch và prototype gốc
```

## Cài đặt

```bash
npm install
```

## Chạy frontend

```bash
npm run dev:web
```

Frontend mặc định chạy ở `http://localhost:5173`.

## Chạy backend

Tạo file môi trường từ mẫu:

```bash
cp apps/api/.env.example apps/api/.env
```

Cập nhật `DATABASE_URL` theo MySQL local, sau đó chạy:

```bash
npm run dev:api
```

Backend mặc định chạy ở `http://localhost:3000`.

Health endpoint:

```text
GET http://localhost:3000/health
GET http://localhost:3000/api/health
```

## Prisma

Sinh Prisma Client:

```bash
npm run prisma:generate
```

Tạo migration khi MySQL đã sẵn sàng:

```bash
npm run prisma:migrate -w apps/api
```

## Kiểm tra

```bash
npm run typecheck
npm run build
```

## Phạm vi Phase 1

- UI search/detail vẫn dùng mock data trong `apps/web/src/data/mockDocuments.ts`.
- Backend mới có health endpoint, chưa có auth/search API thật.
- Prisma schema ban đầu gồm `User`, `Institution`, `Major`, `Subject`, `Document`.
