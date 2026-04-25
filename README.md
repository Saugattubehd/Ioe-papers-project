# IOE Papers 📚

A modern, full-stack web application for browsing and downloading past year engineering question papers from Nepalese universities — **TU, PU, KU, and PoU**.

---

## 🖥️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Tailwind CSS, React Router v6 |
| Backend | Node.js, Express.js |
| Database | PostgreSQL 16 |
| Auth | JWT (JSON Web Tokens) |
| File Storage | Local filesystem (disk) |
| Containerization | Docker + Docker Compose |

---

## ✨ Features

- 🔍 **Search & Filter** — by university, department, semester, year, or keyword
- 📄 **PDF Preview** — inline PDF viewer with zoom controls
- ⬇️ **Download** — direct PDF downloads with download count tracking
- 🏛️ **Multi-University** — TU, PU, KU, PoU support
- 🔐 **Secret Admin URL** — login page hidden from public navigation
- 👥 **Role-Based Access** — Admin and Moderator roles
- 📤 **Paper Upload** — with department/semester/year tagging
- 🏢 **Department Management** — add/remove departments per university
- 🔑 **Password Management** — admins can reset their own and others' passwords
- 📱 **Fully Responsive** — works on mobile, tablet, and desktop

---

## 🚀 Quick Start (Docker — Recommended)

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/)

### 1. Clone / Extract the project
```bash
cd ioe-papers
```

### 2. Configure environment (optional)
Edit `docker-compose.yml` to change:
- `POSTGRES_PASSWORD` — database password
- `JWT_SECRET` — **change this in production!**
- `ADMIN_SECRET_PATH` — the secret URL path for admin login (default: `secret-admin-panel-7x9k2m`)

### 3. Run with Docker Compose
```bash
docker-compose up --build
```

### 4. Access the app
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| Admin Login | http://localhost:3000/secret-admin-panel-7x9k2m |

### Default Admin Credentials
> ⚠️ **Change these immediately after first login!**

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `Admin@1234` |

---

## 🛠️ Manual Setup (Development)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Database Setup

```bash
# Create database
createdb ioe_papers

# Run schema
psql -U postgres -d ioe_papers -f backend/db/schema.sql
```

Then seed the default admin password. Run this in `psql`:
```sql
-- Password: Admin@1234
UPDATE users SET password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE username = 'admin';
```

Or generate a proper bcrypt hash:
```bash
cd backend
node -e "const b=require('bcryptjs'); b.hash('Admin@1234',10).then(h=>console.log(h))"
# Copy the output hash and UPDATE in psql
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy and fill environment variables
cp .env.example .env
# Edit .env with your DB credentials and secrets

npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install

# Copy and fill environment variables
cp .env.example .env.local
# Edit .env.local

npm start
```

Frontend runs on `http://localhost:3000`

---

## 📁 Project Structure

```
ioe-papers/
├── backend/
│   ├── db/
│   │   ├── pool.js          # PostgreSQL connection pool
│   │   └── schema.sql       # Database schema + seed data
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js          # Login, password reset
│   │   ├── papers.js        # CRUD, upload, download, preview
│   │   ├── universities.js  # Universities & departments
│   │   └── users.js         # User management
│   ├── uploads/             # Uploaded PDF files (gitignored)
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── server.js            # Express app entry point
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── PaperCard.jsx
│   │   │   ├── PDFPreviewModal.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── SearchBar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── PapersPage.jsx
│   │   │   ├── AdminLoginPage.jsx
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminPapersPage.jsx
│   │   │   ├── AdminUsersPage.jsx
│   │   │   ├── AdminDepartmentsPage.jsx
│   │   │   └── AdminSettingsPage.jsx
│   │   ├── services/
│   │   │   └── api.js       # Axios API service
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── index.js
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── postcss.config.js
│   └── tailwind.config.js
│
├── docker-compose.yml
└── README.md
```

---

## 🔐 Authentication & Security

### Admin Secret URL
The admin login page is **NOT linked anywhere** on the public site. Access it at:
```
http://yourdomain.com/<ADMIN_SECRET_PATH>
```
Change `ADMIN_SECRET_PATH` in your environment variables to something unique and hard to guess.

### Roles
| Role | Can Do |
|------|--------|
| **Admin** | Everything — manage users, reset passwords, upload/delete papers, manage departments |
| **Moderator** | Upload papers, manage departments, toggle publish status |

### JWT
Tokens expire after 7 days by default. Change `JWT_EXPIRES_IN` in `.env`.

---

## 📤 Uploading Papers

1. Login to admin at `/<ADMIN_SECRET_PATH>`
2. Go to **Papers** in the sidebar
3. Click **Upload Paper**
4. Fill in: Title, University, Department, Semester, Year
5. Select a PDF (max 50MB)
6. Click **Upload**

---

## 🌱 Adding Initial Data

After setup, add departments via the admin panel:
1. Go to **Departments**
2. Click on a university to expand it
3. Click **"Add Department to [UNI]"**
4. Enter name (e.g. `Computer Engineering`) and code (e.g. `BCE`)

### Common IOE Departments
| Code | Name |
|------|------|
| BCE | Computer Engineering |
| BEL | Electronics & Communication |
| BCT | Computer & IT |
| BME | Mechanical Engineering |
| BCE | Civil Engineering |
| BEE | Electrical Engineering |
| BAG | Agriculture Engineering |
| BIE | Industrial Engineering |

---

## 🔧 Environment Variables

### Backend (`.env`)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ioe_papers
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
UPLOAD_DIR=./uploads
ADMIN_SECRET_PATH=secret-admin-panel-7x9k2m
FRONTEND_URL=http://localhost:3000
```

### Frontend (`.env.local`)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ADMIN_PATH=secret-admin-panel-7x9k2m
```

> ⚠️ `ADMIN_SECRET_PATH` in backend and `REACT_APP_ADMIN_PATH` in frontend **must match**.

---

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in backend
2. Generate a strong `JWT_SECRET` (use `openssl rand -base64 64`)
3. Change `ADMIN_SECRET_PATH` to something unique
4. Change default admin password immediately after first login
5. Consider using a reverse proxy (Nginx/Caddy) with SSL/TLS
6. For file storage at scale, consider AWS S3 or similar

---

## 📄 API Endpoints

### Public
```
GET  /api/papers              List papers (with filters)
GET  /api/papers/:id/preview  Stream PDF for preview
GET  /api/papers/:id/download Download PDF
GET  /api/universities        List universities
GET  /api/universities/:id/departments  List departments
```

### Protected (requires JWT)
```
POST   /api/papers              Upload paper
DELETE /api/papers/:id          Delete paper
PATCH  /api/papers/:id/toggle   Toggle published

POST   /api/universities/:id/departments  Add department
DELETE /api/universities/departments/:id  Delete department

GET    /api/users               List users (admin only)
POST   /api/users               Create user (admin only)
PATCH  /api/users/:id/toggle    Toggle user active status
DELETE /api/users/:id           Delete user

POST   /api/auth/login          Login
GET    /api/auth/me             Get current user
POST   /api/auth/reset-password Reset own password
POST   /api/auth/reset-user-password  Reset any user's password (admin)
```

---

## 📜 License

For educational purposes only. All question papers belong to their respective universities.
