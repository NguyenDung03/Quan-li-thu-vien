# 📚 QLTV





**Hệ thống quản lý thư viện Full-stack**  
Backend API • Admin Portal • Customer Portal • AI Chatbot • Crawl Pipeline




|                  |                        |                       |                  |
| ---------------- | ---------------------- | --------------------- | ---------------- |
| Quản trị dữ liệu | Trải nghiệm người dùng | Hỏi đáp theo tài liệu | Đồng bộ tri thức |


[Features](#-features) • [Architecture](#️-architecture) • [Run](#️-run-development) • [CV Highlights](#-điểm-mạnh-kỹ-thuật-có-thể-đưa-vào-cv)

---

## 🇻🇳 Giới thiệu

**QLTV** là hệ thống quản lý thư viện hiện đại, được thiết kế theo mô hình tách domain rõ ràng giữa backend nghiệp vụ và hai frontend theo vai trò.

Thành phần chính:

- `**be-qltv`**: Backend NestJS (API, auth, payment, chatbot, crawl pipeline)
- `**fe-admin-qltv**`: Dashboard cho admin/thủ thư
- `**fe-customer-qltv**`: Ứng dụng cho người dùng thư viện

Nghiệp vụ cốt lõi:

- Quản lý sách, bản sao vật lý, người dùng, phiếu mượn, đặt trước, phạt
- Thanh toán phí phạt qua PayOS
- Thông báo realtime
- AI chatbot hỗ trợ hỏi đáp dựa trên tài liệu

---

## 🚀 Features

### 🧠 Backend API + Business Logic

- Concurrency-safe renewal/payment flow (`transaction` + `pessimistic lock`)
- Strict database integrity (FK, unique, enums, M2M mapping)
- RBAC authorization via guards + decorators
- Global exception normalization for consistent error contract
- Swagger docs + ValidationPipe for stable API contract
- Scheduled automation (overdue checks, reservation expiration)

### 🤖 AI Chatbot + Crawl Pipeline

- SSE streaming chat response
- Session context per user with Redis
- Anti-overlap user lock for chat requests
- Grounded answering: ưu tiên file user upload, fallback tài liệu thư viện
- Crawl ingestion flow: Crawl4AI -> RabbitMQ -> Worker -> Google File API -> Postgres

### 🖥️ Frontend (Admin + Customer)

- Admin portal với URL-driven filtering/pagination/search
- Data fetching orchestration bằng TanStack Query
- Customer app với realtime notifier (SSE)
- AI chatbot widget trong customer portal (file upload + streaming)
- Responsive UI, component-based architecture, i18n support

---

## 💼 Giá trị triển khai thực tế


- **Đảm bảo nhất quán dữ liệu khi có concurrent requests** trong các flow nhạy cảm như gia hạn/thanh toán.
- **Thiết kế payment flow có idempotency** để giảm rủi ro trùng giao dịch và lỗi callback lặp.
- **Chuẩn hóa error contract toàn hệ thống** giúp frontend tích hợp ổn định, giảm thời gian debug liên team.
- **Tích hợp AI chatbot có grounding theo tài liệu** thay vì trả lời tự do, tăng độ tin cậy nội dung.
- **Xây dựng async ingestion pipeline** để chatbot có nguồn tri thức cập nhật liên tục.
- **Thiết kế frontend theo hướng Product UX**: realtime feedback, phân trang/search có chủ đích, và cấu trúc component dễ bảo trì.

---

## 🏗️ Architecture

```text
QLTV/
├── be-qltv/               # NestJS backend, payment, chatbot, crawl modules
├── fe-admin-qltv/         # React admin dashboard
├── fe-customer-qltv/      # React customer app
└── Quản lý thư viện .sql  # SQL dump (optional)
```

```text
fe-admin-qltv         fe-customer-qltv
      \                     /
       \----- HTTP API ----/
               be-qltv
          /       |       \
   PostgreSQL   Redis   RabbitMQ
                           |
                         Worker
                           |
                    Google File API
                           |
                        Crawl4AI
```

---

## 🛠️ Tech Stack

### Infrastructure & Platform
| Category | Technology | Purpose |
| --- | --- | --- |
| Containerization | `Docker`, `Docker Compose` | Chạy môi trường local nhất quán |
| Data & Messaging | `PostgreSQL`, `Redis`, `RabbitMQ` | Lưu trữ dữ liệu, cache, queue bất đồng bộ |
| External Services | `Crawl4AI`, `Google File API`, `PayOS` | Crawl tri thức, lưu file AI, thanh toán |

### Backend (`be-qltv`)

| Category | Technology | Purpose |
| --- | --- | --- |
| Core Framework | `NestJS`, `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` | Xây dựng API backend theo module |
| Language & Runtime | `TypeScript`, `Node.js`, `reflect-metadata`, `rxjs` | Runtime và foundation cho ứng dụng |
| ORM & Database | `TypeORM`, `@nestjs/typeorm`, `pg` | Truy cập DB, migration, mapping entity |
| Validation | `class-validator`, `class-transformer` | Validate/transform DTO |
| Authentication | `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt` | JWT auth và password hashing |
| Config | `@nestjs/config` | Quản lý biến môi trường |
| Caching | `@nestjs/cache-manager`, `cache-manager`, `cache-manager-redis-store` | Cache dữ liệu và session context |
| Queue/Microservices | `@nestjs/microservices`, `amqplib`, `amqp-connection-manager` | Kết nối RabbitMQ và worker flow |
| HTTP Integration | `@nestjs/axios`, `axios` | Gọi API dịch vụ ngoài |
| AI | `@google/generative-ai` | Sinh phản hồi chatbot |
| File/Media/Email | `cloudinary`, `nodemailer`, `@nestjs-modules/mailer`, `buffer-to-stream` | Upload media và gửi email |
| Utility | `dayjs`, `xlsx` | Xử lý thời gian và export/import dữ liệu |
| API Docs | `@nestjs/swagger`, `swagger-ui-express` | Tài liệu API |
| Scheduler | `@nestjs/schedule` | Cron jobs nghiệp vụ |
| Testing | `@nestjs/testing`, `jest`, `ts-jest`, `supertest` | Unit/integration test |
| Lint/Format | `eslint`, `@eslint/js`, `@eslint/eslintrc`, `eslint-config-prettier`, `eslint-plugin-prettier`, `prettier` | Code quality và formatting |
| Build Tooling | `@nestjs/cli`, `@nestjs/schematics`, `ts-node`, `ts-loader`, `tsconfig-paths`, `typescript`, `typescript-eslint`, `globals`, `source-map-support` | Build, run, dev tooling |
| Type Packages | `@types/bcrypt`, `@types/lodash`, `@types/xlsx`, `@types/cache-manager-redis-store`, `@types/express`, `@types/jest`, `@types/multer`, `@types/node`, `@types/passport-jwt`, `@types/supertest` | Type definitions |

### Frontend Admin (`fe-admin-qltv`)

| Category | Technology | Purpose |
| --- | --- | --- |
| Core | `React`, `React DOM`, `TypeScript`, `Vite` | Xây dựng SPA cho admin |
| Routing & Data | `react-router-dom`, `@tanstack/react-query`, `axios` | Điều hướng và quản lý server-state |
| UI Styling | `Tailwind CSS`, `@tailwindcss/vite`, `tailwind-merge` | Thiết kế giao diện |
| UI Components | `@radix-ui/react-alert-dialog`, `@radix-ui/react-avatar`, `@radix-ui/react-checkbox`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-label`, `@radix-ui/react-popover`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-slot`, `@radix-ui/react-tabs`, `class-variance-authority`, `clsx`, `cmdk` | Hệ component và primitive tương tác |
| UX & Visualization | `framer-motion`, `lucide-react`, `sonner`, `recharts` | Animation, icons, toast, charts |
| Forms & State | `react-hook-form`, `@hookform/resolvers`, `zod`, `zustand` | Form validation và local state |
| i18n | `i18next`, `react-i18next`, `i18next-browser-languagedetector` | Đa ngôn ngữ |
| Tooling | `@vitejs/plugin-react`, `eslint`, `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `typescript-eslint`, `globals`, `@types/node`, `@types/react`, `@types/react-dom` | Build, lint, type checking |

### Frontend Customer (`fe-customer-qltv`)

| Category | Technology | Purpose |
| --- | --- | --- |
| Core | `React`, `React DOM`, `TypeScript`, `Vite` | Xây dựng SPA cho người dùng |
| Routing & Data | `react-router-dom`, `@tanstack/react-query`, `axios` | Điều hướng và dữ liệu từ API |
| UI Styling | `Tailwind CSS`, `@tailwindcss/vite`, `tailwind-merge`, `tw-animate-css`, `class-variance-authority`, `clsx`, `@fontsource-variable/geist` | Thiết kế giao diện và typography |
| Theme & UI Primitives | `next-themes`, `@base-ui/react`, `shadcn` | Theme system và UI primitives |
| UX | `framer-motion`, `lucide-react`, `sonner` | Animation, icons, toast |
| AI Chat | `deep-chat-react` | Chat widget tích hợp streaming |
| Reader | `pdfjs-dist`, `@react-pdf-viewer/core`, `@react-pdf-viewer/default-layout`, `react-pro-sidebar` | Ebook reader và layout điều hướng |
| i18n | `i18next`, `react-i18next`, `i18next-browser-languagedetector` | Đa ngôn ngữ |
| Styling Engine | `@emotion/react`, `@emotion/styled`, `@emotion/is-prop-valid` | CSS-in-JS hỗ trợ component libs |
| Tooling & Testing | `@vitejs/plugin-react`, `eslint`, `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `typescript-eslint`, `globals`, `vitest`, `@testing-library/react`, `jsdom`, `@types/node`, `@types/react`, `@types/react-dom` | Build, lint, test, type checking |


---

## 🧩 Kiến trúc theo module

### Backend (`be-qltv`)

- `catalog-modules`: quản lý dữ liệu danh mục sách
- `inventory-modules`: quản lý bản sao sách vật lý
- `transaction-modules`: luồng mượn/trả/đặt trước/phạt
- `payment`: tích hợp PayOS + webhook verification
- `chat-modules`: AI chat streaming + session context
- `crawl-modules`: crawl dữ liệu + queue worker + document persistence
- `common`: guards, filters, decorators, shared services

### Frontend Admin (`fe-admin-qltv`)

- `pages`: màn hình nghiệp vụ theo domain
- `hooks`: data hooks theo TanStack Query
- `apis`: API layer tách riêng theo resource
- `components`: reusable UI blocks
- `types`: centralized TypeScript contracts

### Frontend Customer (`fe-customer-qltv`)

- `pages`: màn hình cho người dùng thư viện
- `features`: tổ chức theo feature (library, chatbot, ...)
- `components`: UI components tái sử dụng
- `lib/apis`: base utilities và API client
- `providers/contexts`: auth, theme, app-level providers

---

## 📦 Installation

### Prerequisites

- Node.js >= 20
- npm >= 10
- Docker Desktop

### Quick Start

```bash
git clone <your-repo-url>
cd QLTV

cd be-qltv && npm install
cd ../fe-admin-qltv && npm install
cd ../fe-customer-qltv && npm install
```

---

## ⚙️ Environment Variables

Tạo file `.env` trong `be-qltv/`:

```env
# App
PORT=8090
NODE_ENV=development

# CORS
FRONTEND_ADMIN=http://localhost:5173
FRONTEND_CUSTOMER=http://localhost:5174

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=qltv
DATABASE_URL=postgres://postgres:postgres@localhost:5432/qltv

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE=file_upload_queue

# Auth
JWT_SECRET=your_jwt_secret
JWT_SECRET_FORGOT_PASSWORD=your_forgot_password_secret

# PayOS
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
PAYOS_CHECKSUM_KEY=your_payos_checksum_key
PAYOS_RETURN_URL=http://localhost:5174/thanh-toan-thanh-cong
PAYOS_CANCEL_URL=http://localhost:5174/thanh-toan-that-bai

# AI / Integrations
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODEMAILER_USER=your_email
NODEMAILER_PASSWORD=your_email_app_password
```

Tạo `.env` cho frontend:

### `fe-admin-qltv/.env`

```env
VITE_API_URL=http://localhost:8090
```

### `fe-customer-qltv/.env`

```env
VITE_API_URL=http://localhost:8090/api
VITE_API_TIMEOUT=15000
VITE_CHAT_API_URL=http://localhost:8090/api/chat
VITE_PAYOS_RETURN_URL=http://localhost:5174/thanh-toan-thanh-cong
VITE_PAYOS_CANCEL_URL=http://localhost:5174/thanh-toan-that-bai
```

---

## ▶️ Run Development

### 1) Start infrastructure

```bash
cd be-qltv
docker compose up -d
```

### 2) Run backend

```bash
cd be-qltv
npm run migration:run
npm run seed
npm run dev
```

Backend URLs:

- API: `http://localhost:8090/api`
- Swagger: `http://localhost:8090/docs`

### 3) Run frontend apps

```bash
# Terminal 1
cd fe-admin-qltv
npm run dev

# Terminal 2
cd fe-customer-qltv
npm run dev
```

---

## 🔍 Luồng nghiệp vụ nổi bật

### 1) Borrowing & Reservation Lifecycle

- User tìm sách, đặt trước, mượn và theo dõi trạng thái phiếu mượn.
- Hệ thống có cron jobs để tự động cập nhật trạng thái quá hạn/hết hạn reservation.
- Phần phạt và trạng thái phiếu mượn được đồng bộ theo nghiệp vụ thực tế.

### 2) Payment & Fine Management

- Payment flow tích hợp PayOS với webhook verification bằng HMAC-SHA256.
- Áp dụng kỹ thuật idempotency ở tầng database để tránh trùng `payment_code`.
- Dữ liệu liên quan payment có tracking fields rõ ràng cho audit và vận hành.

### 3) AI Chatbot Experience

- Chat endpoint hỗ trợ streaming response qua SSE.
- Mỗi user có session context riêng trong Redis.
- Có lock theo user để tránh overlap khi spam request.
- Trả lời có grounding từ tài liệu user upload hoặc knowledge source đã ingest.

### 4) Crawl Ingestion Operations

- Admin có thể kiểm tra health, submit crawl jobs và theo dõi task results.
- Nội dung crawl được đưa qua RabbitMQ để xử lý bất đồng bộ.
- Worker upload tài liệu lên Google File API, sau đó lưu metadata vào Postgres.

---

## 🔧 Available Scripts

### Backend (`be-qltv`)

```bash
npm run dev
npm run build
npm run migration:run
npm run migration:revert
npm run seed
npm run test
```

### Frontend (`fe-admin-qltv`, `fe-customer-qltv`)

```bash
npm run dev
npm run build
npm run lint
```

---

## 📈 Điểm chú ý

- Thiết kế và triển khai **concurrency-safe transaction flow** cho nghiệp vụ gia hạn/phạt trong NestJS + TypeORM, giảm rủi ro race condition ở các thao tác tài chính.
- Xây dựng **idempotency strategy cho payment** bằng sequence + partial unique index, tăng độ an toàn khi callback/retry xảy ra lặp.
- Triển khai **RBAC + JWT guard architecture** ở backend theo mô hình module hóa, giúp authorization policy rõ ràng và dễ audit.
- Chuẩn hóa **global error handling contract** giữa backend và frontend, cải thiện khả năng quan sát lỗi và giảm công sức debug tích hợp.
- Phát triển **AI chatbot streaming** với Redis-backed session context và document grounding, nâng độ tin cậy câu trả lời cho use cases nội quy/tài liệu thư viện.
- Xây dựng **crawl-to-knowledge async pipeline** (Crawl4AI, RabbitMQ, worker, persistence), chuyển bài toán ingest dữ liệu từ thủ công sang tự động.
- Thiết kế **Admin dashboard với TanStack Query + URL-driven state**, giúp phân trang/lọc/tìm kiếm ổn định và hỗ trợ deep-linking cho vận hành.
- Tối ưu **Customer UX** với realtime notifications, chatbot widget, và kiến trúc component-based giúp mở rộng tính năng nhanh mà vẫn giữ maintainability.

---

## ✨ Notable Engineering Points

- Concurrency-safe transaction processing cho luồng mượn/trả/phạt
- Xác thực payment webhook theo hướng security-first
- Trải nghiệm AI chat realtime với document-grounded responses
- Async ingestion pipeline phục vụ knowledge base cho chatbot
- Modular FE architecture tập trung UX và maintainability

---

Made with ❤️ by Dũng