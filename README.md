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
- Lưu data vào Docker volume `cityload_cityload_data`

### 5. Restore Database từ Backup

```bash
# Copy file backup vào container
docker cp cityload_gis.backup cityload-db:/tmp/

# Restore backup
docker exec -it cityload-db pg_restore -U postgres -d cityload --no-owner --no-acl /tmp/cityload_gis.backup
```

> **💡 Lưu ý**: Entities trong code đã được config sẵn để khớp với schema của backup. Bạn không cần ALTER table hay sửa gì thêm.

**Warning sẽ thấy (bình thường):**
```
pg_restore: warning: errors ignored on restore: 1
pg_restore: error: could not execute query: ERROR: schema "public" already exists
```
→ Ignore warning này, không ảnh hưởng gì.

### 6. Chạy Migrations

Sau khi restore, chạy migrations để thêm các bảng mới:

```bash
npm run migration:run
```

### 7. Kiểm tra Database

```bash
# Xem danh sách tables
docker exec -it cityload-db psql -U postgres -d cityload -c "\dt"

# Kiểm tra số lượng data
docker exec -it cityload-db psql -U postgres -d cityload -c "SELECT COUNT(*) FROM districts;"
docker exec -it cityload-db psql -U postgres -d cityload -c "SELECT COUNT(*) FROM grid_cells;"
```

Bạn sẽ thấy:
- `districts`: 24 quận/huyện
- `grid_cells`: ~290,000 cells
- `feedbacks`, `ai_buildings`, `ai_land_usage`: Các bảng mới từ migration

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

### ❌ Lỗi kết nối database

1. Kiểm tra Docker đang chạy: `docker ps`
2. Kiểm tra port 5433 không bị chiếm
3. Kiểm tra `.env` đúng cấu hình

### ❌ Lỗi restore backup: "relation already exists"

**Nguyên nhân**: Bạn đã chạy migration TRƯỚC KHI restore backup.

**Cách fix**:
```bash
# 1. Xóa database và volume
docker-compose down -v

# 2. Start lại database
docker-compose up -d

# 3. Restore backup TRƯỚC
docker cp cityload_gis.backup cityload-db:/tmp/
docker exec -it cityload-db pg_restore -U postgres -d cityload --no-owner --no-acl /tmp/cityload_gis.backup

# 4. SAU ĐÓ mới chạy migration
npm run migration:run
```

### ❌ Lỗi entity không khớp với database

**Error message**: `column "geometry" does not exist` hoặc tương tự

**Nguyên nhân**: Entity trong code không khớp với schema trong database

**Cách fix**:
1. Pull code mới nhất từ Git
2. Chạy migrations: `npm run migration:run`
3. Nếu vẫn lỗi, liên hệ team lead

### ❌ Performance chậm khi query

Đảm bảo đã chạy migration để tạo indexes:
```bash
npm run migration:run
```

### ❌ Warning "version is obsolete" khi chạy docker-compose

```
level=warning msg="docker-compose.yml: the attribute `version` is obsolete"
```

→ **Hoàn toàn bình thường!** Docker Compose 2.x không cần `version` field nữa. Ignore warning này.

---

## License

MIT

