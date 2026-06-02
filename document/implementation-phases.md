# Implementation Phases - Website chia se tai lieu hoc tap

## Tong quan

Project nen chia thanh 6 phase, di tu nen tang ky thuat den he thong co the van hanh. Thu tu de xuat:

```text
Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 -> Phase 5 -> Phase 6
```

Neu can demo nhanh, nen hoan thanh toi thieu Phase 1-4. Khi do san pham da co cac nang luc loi: tim kiem tai lieu, xem chi tiet, upload, review, cap badge xac thuc va ranking theo do tin cay.

## Phase 1 - Foundation + Prototype Migration

Muc tieu: dung nen ky thuat va chuyen prototype hien tai thanh app React that.

Cong viec:

- Setup repo theo cau truc `apps/web`, `apps/api`, `packages/shared` neu can.
- Khoi tao frontend React + TypeScript + Vite.
- Khoi tao backend Node.js + TypeScript.
- Cai dat MySQL integration thong qua Prisma.
- Tao schema ban dau cho user, institution, major, subject, document.
- Tach `document/document-system.jsx` thanh cac component React TypeScript:
  - `DocumentCard`
  - `SearchPage`
  - `DetailPage`
  - `VerificationBadge`
  - `LargeVerificationSeal`
  - `FilterSidebar`
  - `SortSelect`
- Dua mock data ra file rieng hoac seed data.
- Sua loi encoding/copy tieng Viet trong prototype sang UTF-8.
- Tao README huong dan chay local.

Ket qua can dat:

- Frontend chay local duoc.
- Backend chay local duoc.
- MySQL/Prisma connect duoc.
- Prototype khong con la mot file JSX lon.
- UI search/detail van hien thi du lieu mau.

## Phase 2 - Core Document Search

Muc tieu: giai quyet challenge 1 o muc co ban: nguoi dung tim duoc tai lieu dang tin.

Cong viec:

- Tao API `GET /api/documents`.
- Tao API `GET /api/documents/:id`.
- Ho tro search theo tu khoa.
- Ho tro filter theo:
  - Nganh hoc.
  - Mon hoc.
  - Loai tai lieu.
  - Badge xac thuc.
  - Nam hoc/hoc ky neu da co data.
- Ho tro sort theo:
  - Relevance.
  - Newest.
  - Popular.
  - Rating.
- Frontend thay mock data bang API that.
- Dong bo filter/search/sort voi URL query params.
- Them loading, error, empty state va pagination.

Ket qua can dat:

- Nguoi dung co the tim va xem tai lieu tu MySQL.
- Ket qua search uu tien tai lieu lien quan va dang tin cay.

## Phase 3 - Auth + Upload

Muc tieu: cho sinh vien dong gop tai lieu.

Cong viec:

- Dang ky, dang nhap, logout.
- Role co ban:
  - `student`
  - `reviewer`
  - `admin`
- Middleware auth va role guard.
- Form upload tai lieu.
- Metadata bat buoc khi upload:
  - Title.
  - Description.
  - Major.
  - Subject.
  - Instructor neu co.
  - Document type.
  - Term/year.
  - Exam lien quan neu co.
  - Tags.
- Upload file PDF hoac file hoc tap duoc cho phep.
- Luu file local cho MVP.
- Tai lieu moi co status `pending` va badge `unverified`.

Ket qua can dat:

- Student upload duoc tai lieu.
- Tai lieu moi can qua kiem duyet truoc khi duoc uu tien hien thi.

## Phase 4 - Review + Trust System

Muc tieu: tao do tin cay cho nen tang.

Cong viec:

- Reviewer dashboard.
- Queue tai lieu `pending`.
- Reviewer co the:
  - Approve.
  - Reject.
  - Request changes.
- Cap badge:
  - `gold`: duoc co so dao tao/giang vien/admin hoc thuat phe duyet.
  - `silver`: duoc giang vien/TA/reviewer bo mon xac minh.
  - `bronze`: duoc cong dong danh gia tot.
  - `unverified`: chua xac thuc.
- Luu lich su review.
- Rating 1-5 sao.
- Comment.
- Report tai lieu sai/vi pham.
- Ranking uu tien tai lieu co badge cao va rating tot.

Ket qua can dat:

- He thong co workflow xac thuc tai lieu ro rang.
- Badge hien nhat quan tren list/detail.
- Tai lieu tin cay duoc uu tien trong search.

## Phase 5 - Exam Mode + Personalization

Muc tieu: giai quyet challenge 2: sinh vien tim nhanh tai lieu truoc ky thi.

Cong viec:

- Cho nguoi dung dang ky mon dang hoc.
- Quan ly ky thi:
  - Midterm.
  - Final.
  - Quiz.
  - Exam date.
- Dashboard ca nhan theo mon dang hoc.
- Quick review section truoc ky thi.
- Survival kit theo mon/ky thi.
- Ranking tai lieu theo:
  - Mon hoc.
  - Ky thi sap den.
  - Badge xac thuc.
  - Rating.
  - Luot tai/luot xem.
- Email notification co ban truoc ky thi neu kip.

Ket qua can dat:

- Sinh vien thay ngay tai lieu quan trong cho mon sap thi.
- Giam thoi gian tim kiem tai lieu truoc ky thi.

## Phase 6 - Admin + Production Hardening

Muc tieu: du on dinh de demo/pilot/van hanh noi bo.

Cong viec:

- Admin CRUD:
  - Institution.
  - Major.
  - Subject.
  - Instructor.
  - Exam.
- Quan ly user role.
- Quan ly report va an tai lieu vi pham.
- Audit log cho hanh dong quan trong.
- Test API chinh.
- Frontend e2e test cho search, detail, upload, review.
- Docker Compose cho web/api/mysql.
- Rate limit.
- Upload limit.
- File validation.
- README deploy/local setup.

Ket qua can dat:

- Admin co the van hanh taxonomy va moderation.
- He thong du on dinh de demo nghiem tuc hoac pilot.

## Uu tien demo

Neu thoi gian ngan:

1. Lam Phase 1.
2. Lam Phase 2.
3. Rut gon Phase 3 chi con login basic va upload.
4. Lam Phase 4 voi reviewer dashboard don gian.
5. Phase 5 chi can exam mode/survival kit mock tu data that.

Tinh nang nen cat neu thieu thoi gian:

- AI recommendation.
- AI summary.
- Push notification.
- Syllabus calendar.
- Elasticsearch/OpenSearch.
- Analytics nang cao.
