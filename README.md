# Website chia sẻ tài liệu học tập

Phase 3 bổ sung auth cơ bản và upload tài liệu local trên nền search/detail API của Phase 2.

## Stack

- Frontend: React + TypeScript + Vite, `lucide-react`
- Backend: Node.js + TypeScript + Express
- Database: MySQL
- ORM: Prisma

## Cấu trúc

```text
apps/
  api/      Backend Express, Prisma schema, document search/detail API
  web/      Frontend Vite React TypeScript
packages/
  shared/   Kiểu response và enum dùng chung
document/  Tài liệu kế hoạch và prototype gốc
```

## Cài đặt

```bash
npm install
```

## Chạy backend

Tạo file môi trường từ mẫu:

```bash
cp apps/api/.env.example apps/api/.env
```

Cập nhật `DATABASE_URL` theo MySQL local, sau đó chạy migration, seed và API:

```bash
npm run prisma:migrate -w apps/api
npm run prisma:seed
npm run dev:api
```

Backend mặc định chạy ở `http://localhost:3000`.

Health endpoint:

```text
GET http://localhost:3000/health
GET http://localhost:3000/api/health
```

Auth dùng `JWT_SECRET` trong `apps/api/.env`; nếu chưa cấu hình, backend dùng secret dev mặc định.

## Chạy frontend

```bash
npm run dev:web
```

Frontend mặc định chạy ở `http://localhost:5173`.

Nếu API không chạy ở `http://localhost:3000`, tạo `apps/web/.env`:

```bash
VITE_API_BASE_URL=http://localhost:3000
```

## Tài khoản demo

Sau khi chạy seed, có thể dùng các tài khoản sau để kiểm thử:

```text
student@veritas.local / Password123
reviewer@veritas.local / Password123
admin@veritas.local / Password123
```

- `student`: upload tài liệu, rating, bình luận và báo cáo tài liệu.
- `reviewer`: mở `/review` để approve, reject hoặc request changes.
- `admin`: có toàn quyền reviewer và có thể cấp badge gold.

## API Phase 2-3

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
GET /api/documents
POST /api/documents
GET /api/documents/:id
GET /api/documents/filters
GET /api/documents/upload-options
```

Query params cho `GET /api/documents`:

```text
q, majorId, subjectId, type, verificationLevel, year, sort, page, limit
```

`sort` hỗ trợ `relevance`, `newest`, `popular`, `rating`. `type` và `verificationLevel` có thể truyền nhiều giá trị bằng dấu phẩy.

`POST /api/documents` yêu cầu bearer token và `multipart/form-data` với field `file`, `title`, `description`, `majorId`, `subjectId`, `documentType`, `year`, `termLabel`, `tags`; các field `instructorName`, `examName`, `authorName`, `pages` là tùy chọn. Tài liệu upload mới có `verificationStatus=pending` và `verificationLevel=unverified`.

## Kiểm tra

```bash
npm run typecheck
npm run build
```

## Phạm vi Phase 3

- Frontend search/detail gọi API thật.
- Search đồng bộ với URL query params.
- Có loading, error, empty state và pagination.
- Ranking `relevance` ưu tiên độ khớp nội dung, ngành/môn, badge xác thực, rating, độ phổ biến và độ mới.
- Đăng ký, đăng nhập, logout và `/api/auth/me`.
- Middleware auth và role guard cơ bản cho upload.
- Form upload tài liệu trên `/upload`.
- Upload local qua `multer`, validate loại file và metadata bắt buộc.
- Tài liệu mới vào hàng chờ kiểm duyệt với badge chưa xác thực.
- Review workflow thuộc phase sau.
