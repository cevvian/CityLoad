# CityLoad API

Backend API cho hệ thống phát hiện đối tượng và phân vùng từ ảnh vệ tinh.

## Tech Stack

- **Framework**: NestJS + TypeScript
- **Database**: PostgreSQL + PostGIS
- **ORM**: TypeORM
- **Docs**: Swagger

---

## Yêu cầu

- Node.js >= 18
- Docker & Docker Compose
- (Optional) PostgreSQL client để debug

---

## Cài đặt

### 1. Clone repository

```bash
git clone https://github.com/cevvian/CityLoad.git
cd CityLoad
```

### 2. Cài dependencies

```bash
npm install
```

### 3. Tạo file `.env`

```bash
cp .env.example .env
```

Hoặc tạo file `.env` với nội dung:

```env
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=123456
DB_DATABASE=cityload

AI_SERVICE_URL=http://localhost:8000
```

### 4. Khởi động Database (Docker)

```bash
docker-compose up -d
```

Lệnh này sẽ:
- Tạo PostgreSQL 17 với PostGIS
- Tự động enable PostGIS extension
- Lưu data vào Docker volume

### 5. Restore dữ liệu (nếu có file backup)

```bash
# Copy file backup vào container
docker cp cityload_gis.backup cityload-db:/tmp/

# Restore
docker exec -it cityload-db pg_restore -U postgres -d cityload --no-owner --no-acl /tmp/cityload_gis.backup
```

### 6. Chạy migrations

> **⚠️ QUAN TRỌNG**: Bắt buộc phải chạy migrations mỗi khi pull code mới từ Git!

```bash
npm run migration:run
```

**Tại sao phải chạy migrations?**
- Migrations đảm bảo database schema đồng bộ với team
- Tự động tạo indexes, enums, và constraints cần thiết
- Không chạy migrations có thể gây lỗi hoặc performance kém

**Kiểm tra migrations đã chạy chưa:**
```sql
-- Connect vào PostgreSQL
docker exec -it cityload-db psql -U postgres -d cityload

-- Xem danh sách migrations đã chạy
SELECT * FROM migrations ORDER BY timestamp DESC;
```

### 7. Khởi động server

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

---

## API Documentation

Truy cập Swagger UI: http://localhost:3000/api

### Endpoints chính

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/maps/grid-cells` | Lấy grid cells theo bounding box |
| POST | `/maps/detect` | Gọi AI detection cho grid cell |

---

## Cấu trúc Project

```
src/
├── config/                 # Cấu hình DB
├── database/
│   ├── entities/           # TypeORM entities
│   ├── migrations/         # DB migrations
│   └── data-source.ts      # TypeORM data source
├── modules/
│   ├── maps/               # Map APIs
│   ├── search/             # Search APIs
│   ├── detection/          # AI integration
│   └── feedback/           # User feedback
└── main.ts                 # Entry point
```

---

## Scripts

| Script | Mô tả |
|--------|-------|
| `npm run start:dev` | Chạy development server |
| `npm run build` | Build production |
| `npm run migration:generate` | Tạo migration mới |
| `npm run migration:run` | Chạy migrations |

---

## Database

### Kết nối PostgreSQL

```bash
docker exec -it cityload-db psql -U postgres -d cityload
```

### Xem tables

```sql
\dt                    -- Danh sách tables
\d grid_cells          -- Cấu trúc table
\di                    -- Danh sách indexes
```

### Database Migrations

**Tạo migration mới khi thay đổi entities:**

```bash
# Tự động generate từ entity changes
npm run migration:generate src/database/migrations/DescribeYourChanges

# Hoặc tạo empty migration
npm run typeorm -- migration:create src/database/migrations/YourMigrationName
```

**Performance Indexes:**

Hệ thống đã có các indexes sau để tối ưu performance:
- `idx_grid_status`: Query theo status (PENDING/PROCESSED/ERROR)
- `idx_grid_district`: Query theo quận
- `idx_grid_ward`: Query theo phường
- `idx_grid_district_status`: Query combined district + status

> **⚠️ KHÔNG bao giờ chạy SQL trực tiếp vào production database!**  
> Luôn tạo migration để team có thể sync changes.

---

## Troubleshooting

### Lỗi kết nối database

1. Kiểm tra Docker đang chạy: `docker ps`
2. Kiểm tra port 5433 không bị chiếm
3. Kiểm tra `.env` đúng cấu hình

### Lỗi migration

```bash
# Reset database
docker-compose down -v
docker-compose up -d
npm run migration:run
```

### Performance chậm khi query

Đảm bảo đã chạy migration để tạo indexes:
```bash
npm run migration:run
```

---

## License

MIT

