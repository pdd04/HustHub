# Implementation Plan - Website chia se tai lieu hoc tap

## 1. Muc tieu du an

Xay dung website chia se tai lieu hoc tap co do tin cay cao cho sinh vien. He thong giup nguoi dung:

- Tim tai lieu on tap dang tin cay theo nganh, mon hoc, giang vien, ky thi va loai tai lieu.
- Nhan biet tai lieu da duoc kiem duyet bang badge xac thuc.
- Giam thoi gian tim kiem truoc ky thi thong qua bo loc nhanh, sap xep uu tien, goi tai lieu quan trong va goi y theo mon dang hoc.
- Cho phep sinh vien dong gop tai lieu, danh gia, binh luan; cho phep giang vien, TA hoac nguoi duoc phe duyet review va cap badge.

Stack:

- Backend: Node.js, TypeScript.
- Frontend: React, TypeScript.
- Database: MySQL.
- File storage: local storage cho MVP, co the doi sang S3/MinIO o giai doan production.

Tai lieu hien co:

- `document/document-system.jsx`: prototype React mot file, gom search page, document card, detail page, badge xac thuc vang/bac/dong, filter theo nganh/mon/loai/xac thuc, sort theo moi nhat/pho bien/rating.

## 2. Pham vi MVP

MVP nen tap trung vao 2 challenge chinh:

1. Nguoi dung tim duoc tai lieu dang tin cay.
2. Nguoi dung tim duoc tai lieu can thiet trong thoi gian ngan truoc ky thi.

Tinh nang MVP:

- Dang ky, dang nhap, phan quyen: student, reviewer, admin.
- Quan ly nganh hoc, mon hoc, giang vien, hoc ky, ky thi.
- Upload tai lieu PDF hoac file hoc tap, gan metadata day du.
- Danh sach va chi tiet tai lieu.
- Tim kiem, loc va sap xep tai lieu theo:
  - Tu khoa.
  - Nganh hoc.
  - Mon hoc.
  - Loai tai lieu: giao trinh, bai giang, de cuong, de thi cu, note tom tat.
  - Cap xac thuc: gold, silver, bronze, unverified.
  - Nam hoc, hoc ky, giang vien, ky thi.
  - Rating, luot tai, luot xem, moi nhat, do lien quan.
- Quy trinh review tai lieu va cap badge xac thuc.
- Rating 1-5 sao, comment, report tai lieu sai/vi pham.
- Dashboard ca nhan hien tai lieu lien quan den mon da dang ky.
- Quick review section truoc ky thi: tai lieu uu tien, goi survival kit theo mon va ky thi.

Ngoai MVP, de sau:

- AI recommendation.
- AI summary.
- Push notification mobile.
- Syllabus calendar lien ket tung buoi hoc.
- Full-text search nang cao bang Elasticsearch/OpenSearch.

## 3. Kien truc tong quan

### 3.1. Cau truc repo de xuat

```text
.
+-- apps
|   +-- api
|   |   +-- src
|   |   |   +-- config
|   |   |   +-- modules
|   |   |   +-- middleware
|   |   |   +-- jobs
|   |   |   +-- routes
|   |   |   +-- server.ts
|   |   +-- prisma
|   |   |   +-- schema.prisma
|   |   |   +-- migrations
|   |   +-- package.json
|   +-- web
|       +-- src
|       |   +-- app
|       |   +-- components
|       |   +-- features
|       |   +-- hooks
|       |   +-- lib
|       |   +-- pages
|       |   +-- styles
|       +-- package.json
+-- packages
|   +-- shared
|       +-- src
+-- document
|   +-- document-system.jsx
|   +-- implementation-plan.md
+-- README.md
```

### 3.2. Backend de xuat

- Framework: Express hoac Fastify voi TypeScript.
- ORM: Prisma voi MySQL.
- Auth: JWT access token + refresh token, password hash bang bcrypt/argon2.
- Validation: Zod.
- Upload: Multer cho MVP; luu file vao `uploads/`, luu metadata trong MySQL.
- API docs: OpenAPI/Swagger.
- Test: Vitest/Jest + Supertest.

### 3.3. Frontend de xuat

- React + TypeScript + Vite.
- Routing: React Router.
- Data fetching: TanStack Query.
- Form: React Hook Form + Zod.
- UI: tach prototype hien tai thanh component tai su dung.
- Icons: lucide-react, giu cung thu vien prototype dang dung.

## 4. Data model MySQL

### 4.1. Bang nguoi dung va phan quyen

`users`

- `id`
- `email`
- `password_hash`
- `full_name`
- `student_code`
- `institution_id`
- `major_id`
- `role`: student, reviewer, admin
- `status`: active, suspended
- `created_at`, `updated_at`

`roles` va `permissions` chi can tach rieng neu du an can RBAC phuc tap. MVP co the dung enum role trong `users`.

### 4.2. Bang hoc thuat

`institutions`

- Truong/don vi dao tao.

`majors`

- Nganh/chuyen nganh.
- Lien ket `institution_id` neu can theo tung truong.

`subjects`

- `id`
- `major_id`
- `code`
- `name`
- `description`

`instructors`

- `id`
- `institution_id`
- `full_name`
- `email`
- `title`

`terms`

- Nam hoc, hoc ky.

`exams`

- `id`
- `subject_id`
- `term_id`
- `exam_type`: midterm, final, quiz, other
- `exam_date`
- `description`

`user_subjects`

- Mon nguoi dung dang hoc trong ky hien tai.
- Dung cho dashboard, goi y va notification.

### 4.3. Bang tai lieu

`documents`

- `id`
- `title`
- `description`
- `author_name`
- `uploader_id`
- `institution_id`
- `major_id`
- `subject_id`
- `instructor_id`
- `exam_id`
- `document_type`: textbook, lecture, past_exam, summary_note, exercise, survival_kit, other
- `year`
- `term_id`
- `pages`
- `language`
- `file_url`
- `thumbnail_url`
- `file_size`
- `mime_type`
- `verification_level`: unverified, bronze, silver, gold
- `verification_status`: pending, approved, rejected
- `visibility`: public, private, hidden
- `rating_avg`
- `rating_count`
- `view_count`
- `download_count`
- `created_at`, `updated_at`

`document_tags`

- Luu tag nhu SQL, Machine Learning, past exam, final, frequent.

`document_reviews`

- Review xac thuc noi dung boi reviewer/admin.
- `reviewer_id`
- `document_id`
- `decision`: approve, reject, request_changes
- `verification_level`
- `comment`
- `created_at`

`ratings`

- Rating va comment cua sinh vien.
- Unique theo `user_id + document_id`.

`reports`

- Bao cao tai lieu sai, trung lap, vi pham ban quyen, noi dung doc hai.

`bookmarks`

- Tai lieu da luu.

`document_events`

- Tracking view/download/read_online de tinh ranking va recommendation.

### 4.4. Bang goi tai lieu va recommendation

`survival_kits`

- Goi tai lieu theo mon/ky thi, vi du "Database Final Survival Kit".

`survival_kit_documents`

- Danh sach tai lieu trong goi, co `priority_order`.

`recommendations`

- Ket qua goi y da tinh san theo user, subject, exam.
- MVP co the tinh on-the-fly, chua can bang nay.

## 5. Ranking va do tin cay

### 5.1. Cap badge xac thuc

- `gold`: duoc co so dao tao, giang vien chinh thuc hoac admin hoc thuat phe duyet.
- `silver`: duoc giang vien/TA/reviewer bo mon xac minh.
- `bronze`: duoc cong dong danh gia tot, co du rating toi thieu va khong co report nghiem trong.
- `unverified`: moi upload, chua duoc kiem duyet.

### 5.2. Diem ranking de sap xep "lien quan nhat"

Cong thuc MVP de xuat:

```text
score =
  text_match_score * 0.35 +
  subject_match_score * 0.20 +
  verification_score * 0.20 +
  rating_score * 0.10 +
  popularity_score * 0.10 +
  recency_score * 0.05
```

Quy doi:

- `verification_score`: gold 1.0, silver 0.75, bronze 0.45, unverified 0.1.
- `rating_score`: `rating_avg / 5`.
- `popularity_score`: chuan hoa tu view/download trong 90 ngay.
- `recency_score`: uu tien tai lieu moi hoac cap nhat gan day.
- `subject_match_score`: 1.0 neu dung mon, 0.5 neu cung nganh, 0 neu khac.

MVP co the tinh trong service backend. Khi du lieu lon hon, chuyen sang materialized ranking table hoac search engine.

## 6. API backend

### 6.1. Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### 6.2. Academic taxonomy

- `GET /api/institutions`
- `GET /api/majors`
- `GET /api/subjects?majorId=...`
- `GET /api/instructors?subjectId=...`
- `GET /api/exams?subjectId=...&termId=...`

### 6.3. Documents

- `GET /api/documents`
  - Query: `q`, `majorId`, `subjectId`, `type`, `verificationLevel`, `instructorId`, `examType`, `year`, `termId`, `sort`, `page`, `limit`.
- `GET /api/documents/:id`
- `POST /api/documents`
  - Tao metadata va upload file.
- `PATCH /api/documents/:id`
  - Uploader/admin cap nhat metadata.
- `DELETE /api/documents/:id`
  - Soft delete.
- `POST /api/documents/:id/view`
- `POST /api/documents/:id/download`
- `POST /api/documents/:id/bookmark`
- `DELETE /api/documents/:id/bookmark`

### 6.4. Review va xac thuc

- `GET /api/reviewer/documents?status=pending`
- `POST /api/reviewer/documents/:id/reviews`
- `PATCH /api/reviewer/documents/:id/verification`
- `GET /api/reviewer/stats`

### 6.5. Rating, comment, report

- `GET /api/documents/:id/ratings`
- `POST /api/documents/:id/ratings`
- `PATCH /api/documents/:id/ratings/me`
- `POST /api/documents/:id/reports`

### 6.6. Dashboard va exam mode

- `GET /api/me/subjects`
- `POST /api/me/subjects`
- `DELETE /api/me/subjects/:subjectId`
- `GET /api/me/dashboard`
- `GET /api/exam-mode`
  - Tra ve tai lieu uu tien theo mon dang hoc va exam sap den.
- `GET /api/survival-kits?subjectId=...&examId=...`
- `GET /api/recommendations`

## 7. Frontend React

### 7.1. Pages

- `/login`, `/register`.
- `/documents`: trang tim kiem va loc tai lieu, lay cam hung tu `SearchPage` trong prototype.
- `/documents/:id`: trang chi tiet, lay cam hung tu `DetailPage`.
- `/upload`: form upload tai lieu.
- `/dashboard`: tai lieu lien quan den mon dang hoc, tai lieu moi, tai lieu sap thi.
- `/exam-mode`: quick review truoc ky thi, survival kit, ranking theo mon/ky thi.
- `/bookmarks`: tai lieu da luu.
- `/reviewer`: hang doi review.
- `/admin`: quan ly taxonomy, users, documents, reports.

### 7.2. Components can tach tu prototype

- `VerificationBadge`.
- `LargeVerificationSeal`.
- `DocumentCard`.
- `SearchBar`.
- `FilterSidebar`.
- `SortSelect`.
- `DocumentStats`.
- `DocumentActions`.
- `ReviewStatusBadge`.
- `RatingStars`.
- `Pagination`.
- `EmptyState`.

### 7.3. State va data fetching

- Dung TanStack Query cho API calls, cache theo query params.
- Search/filter dong bo voi URL query params de share link.
- Upload dung form multipart, hien progress.
- Auth state luu access token ngan han, refresh token httpOnly cookie neu backend ho tro.

### 7.4. UX quan trong

- Search nhanh, filter ro rang, ket qua khong bi day boi tai lieu chua xac thuc.
- Badge phai co tooltip/modal giai thich tieu chi.
- Trang upload bat buoc nhap metadata hoc thuat de tang chat luong search.
- Exam mode khong nen qua tai: hien top documents, survival kit, past exams, summary notes.
- Mobile can co drawer filter tuong tu bien `showMobileFilters` trong prototype.

## 8. Quy trinh nghiep vu

### 8.1. Upload tai lieu

1. Student dang nhap.
2. Chon file.
3. Nhap title, description, subject, instructor, term, document type, exam lien quan, tags.
4. Backend validate file type, size, metadata.
5. Luu file va metadata.
6. Trang thai ban dau: `verification_status = pending`, `verification_level = unverified`.
7. Tai lieu co the hien thi voi nhan "chua xac thuc" hoac chi hien sau khi admin cho phep, tuy chinh policy.

### 8.2. Review va cap badge

1. Reviewer xem hang doi tai lieu pending.
2. Reviewer doc file, kiem tra noi dung, nguon, metadata, trung lap.
3. Reviewer approve/reject/request changes.
4. Neu approve, reviewer chon badge gold/silver hoac de bronze neu chi du tin cay cong dong.
5. He thong ghi `document_reviews` va cap nhat `documents`.
6. Badge hien tren list/detail va duoc tinh vao ranking.

### 8.3. Rating va feedback cong dong

1. Student da dang nhap danh gia 1-5 sao va comment.
2. Backend update rating average va rating count.
3. Tai lieu dat nguong rating/so luot danh gia co the duoc de xuat len bronze.
4. Report nghiem trong lam giam ranking hoac tam an tai lieu.

### 8.4. Exam mode

1. Student dang ky mon hoc dau ky.
2. Admin/reviewer tao exam date hoac import lich thi.
3. Khi sap thi, dashboard hien:
   - Top summary notes.
   - Past exams.
   - Survival kit.
   - Tai lieu gold/silver lien quan truc tiep.
4. Sort mac dinh dua tren exam date, subject, verification, rating va download trong cac ky truoc.

## 9. Milestone trien khai

### Milestone 0 - Chuan hoa prototype va setup

- Tao monorepo hoac tach `apps/api`, `apps/web`.
- Khoi tao Vite React TS cho frontend.
- Khoi tao Node.js TS backend.
- Cai ESLint, Prettier, tsconfig, env example.
- Chuyen `document/document-system.jsx` thanh cac component React TS.
- Sua encoding/copy UI sang tieng Viet UTF-8.
- Tao README huong dan chay local.

Ket qua:

- Chay duoc web local.
- Prototype khong con du lieu mock nam cung trong component lon.

### Milestone 1 - Database va auth

- Cai MySQL local.
- Tao Prisma schema cho user, institution, major, subject, document.
- Tao migration dau tien.
- Seed data mau tu prototype: fields, subjects, documents.
- Lam auth register/login/me.
- Lam middleware auth va role guard.

Ket qua:

- User dang ky/dang nhap duoc.
- Backend ket noi MySQL va co seed data.

### Milestone 2 - Document listing/search/filter

- Tao API `GET /api/documents`.
- Ho tro query params cho search/filter/sort/pagination.
- Tinh ranking co ban cho sort `relevance`.
- Frontend thay mock data bang API.
- Dong bo filter voi URL.
- Them loading, error, empty states.

Ket qua:

- Trang `/documents` hoat dong voi du lieu MySQL.
- Loc theo nganh/mon/loai/xac thuc va sort dung.

### Milestone 3 - Document detail va interaction

- Tao API detail document.
- Tracking view/download.
- Lam download endpoint co permission/logging.
- Lam bookmark.
- Lam rating/comment.
- Frontend detail page goi API that.

Ket qua:

- Nguoi dung xem chi tiet, doc/tai, luu, danh gia tai lieu.
- Metrics view/download/rating duoc cap nhat.

### Milestone 4 - Upload tai lieu

- Lam form upload.
- Validate client va server.
- Luu file local trong MVP.
- Tao thumbnail placeholder theo loai file hoac trang dau PDF neu co thu vien phu hop.
- Tai lieu moi vao queue pending.

Ket qua:

- Student dong gop tai lieu moi duoc.
- Metadata du day du de search.

### Milestone 5 - Review workflow va badge

- Tao reviewer dashboard.
- Queue tai lieu pending.
- Approve/reject/request changes.
- Cap verification level.
- Log lich su review.
- Frontend hien badge va modal tieu chi badge.

Ket qua:

- Co quy trinh kiem duyet that.
- Tai lieu da duoc review duoc uu tien trong search.

### Milestone 6 - Dashboard va exam mode

- Tao user_subjects de sinh vien dang ky mon hoc.
- Tao exam data.
- Tao API dashboard va exam mode.
- Tao survival kit theo mon/ky thi.
- Hien quick review section truoc ky thi.

Ket qua:

- Sinh vien thay tai lieu can hoc theo mon dang ky.
- Khi sap thi, he thong uu tien tai lieu can doc nhat.

### Milestone 7 - Admin va moderation

- CRUD institution, major, subject, instructor, exam.
- Quan ly user role.
- Quan ly reports.
- Hide/unhide document.
- Audit logs cho hanh dong quan trong.

Ket qua:

- Admin co the van hanh taxonomy va chat luong noi dung.

### Milestone 8 - Testing, hardening, deploy

- Unit test services ranking, auth, document filter.
- Integration test API chinh.
- Frontend component/e2e test cho search, detail, upload, review.
- Rate limit auth/upload.
- Scan file type va gioi han dung luong.
- Docker Compose cho api, web, mysql.
- Deploy staging.

Ket qua:

- He thong du on dinh de demo hoac pilot.

## 10. Thu tu uu tien backlog

Priority P0:

- Setup frontend/backend/database.
- Auth.
- Document search/filter/detail.
- Upload tai lieu.
- Review va badge.

Priority P1:

- Rating/comment/report.
- Bookmark.
- Dashboard ca nhan.
- Survival kit.
- Exam mode.

Priority P2:

- Email notification truoc ky thi.
- Import syllabus/exam schedule.
- Full-text search nang cao.
- AI summary/recommendation.
- Analytics cho admin.

## 11. Bao mat va quyen rieng tu

- Hash password bang argon2 hoac bcrypt.
- JWT expiration ngan, refresh token an toan.
- Validate file upload: MIME, extension, size.
- Khong cho upload file executable.
- Rate limit login va upload.
- Soft delete tai lieu de giu audit trail.
- Role guard cho reviewer/admin endpoint.
- Audit log cho approve/reject/delete/change role.
- Can co policy ban quyen neu chia se giao trinh/de thi.

## 12. Tieu chi nghiem thu MVP

- Student co the dang ky/dang nhap.
- Student co the tim tai lieu theo tu khoa va filter theo nganh, mon, loai, badge.
- Ket qua co sap xep theo relevance, newest, popular, rating.
- Student co the xem chi tiet va tai file.
- Student co the upload tai lieu voi metadata bat buoc.
- Reviewer co the approve/reject va cap badge.
- Badge xac thuc hien nhat quan o list/detail.
- Rating/comment anh huong den diem chat luong.
- Dashboard hien tai lieu theo mon da dang ky.
- Exam mode hien top tai lieu theo mon/ky thi.
- Du lieu luu trong MySQL, khong con phu thuoc mock data trong frontend.

## 13. Rui ro va cach xu ly

- Metadata kem chat luong: bat buoc chon subject, type, exam/term khi upload; admin co man hinh sua taxonomy.
- Tai lieu sai hoac vi pham: can report, moderation, soft hide.
- Search cham khi du lieu tang: them index MySQL truoc, sau do chuyen full-text search sang OpenSearch/Elasticsearch.
- Ranking bi thao tung: gioi han rating 1 user/document, phat hien download lap lai, can audit.
- File storage kho backup: MVP local duoc, production nen dung object storage.
- Copy UI hien tai bi loi encoding: chuan hoa UTF-8 khi tach prototype thanh app that.

## 14. De xuat schema index MySQL

- `documents(subject_id, verification_level, visibility)`
- `documents(major_id, document_type, visibility)`
- `documents(created_at)`
- `documents(rating_avg, rating_count)`
- `documents(download_count)`
- `documents(title)` full-text neu dung MySQL full-text.
- `document_tags(document_id, tag)`
- `ratings(document_id, user_id)` unique.
- `bookmarks(user_id, document_id)` unique.
- `document_events(document_id, event_type, created_at)`
- `user_subjects(user_id, subject_id, term_id)` unique.

## 15. Definition of Done cho moi tinh nang

- Co migration/schema neu thay doi data.
- Co API typed request/response.
- Co validation va error handling.
- Co role/permission check neu can.
- Frontend co loading, empty, error state.
- Co test toi thieu cho logic co rui ro.
- Co seed/demo data neu tinh nang can demo.
- Co update README/API docs neu them endpoint moi.
