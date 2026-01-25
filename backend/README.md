# School Management System - Backend API

## Overview
NestJS + TypeORM + PostgreSQL backend for a comprehensive school management system with RBAC, auto-generated credentials, and PDF report generation.

## Tech Stack
- **Framework:** NestJS (Node.js)
- **Database:** PostgreSQL 15/16
- **ORM:** TypeORM
- **Authentication:** JWT with refresh tokens
- **Authorization:** Role-Based Access Control (RBAC)
- **PDF Generation:** PDFKit & Puppeteer
- **Validation:** class-validator & class-transformer

## Project Status

### ✅ Completed
1. **Project Setup**
   - NestJS project initialized
   - All dependencies installed
   - TypeScript configuration
   - Environment configuration (.env.example)

2. **Database Entities (14 entities)**
   - ✅ User
   - ✅ Role
   - ✅ Teacher
   - ✅ Student
   - ✅ Class
   - ✅ Subject
   - ✅ Academic Session
   - ✅ Term
   - ✅ ClassSubject (pivot)
   - ✅ TeacherSubjectClass (pivot)
   - ✅ FormTeacher
   - ✅ Assessment
   - ✅ Result
   - ✅ Attendance

3. **Authentication Module**
   - ✅ JWT Strategy & Guards
   - ✅ Roles Guard (RBAC)
   - ✅ Login/Logout endpoints
   - ✅ Password change
   - ✅ Password reset flow
   - ✅ Token refresh

4. **Utilities**
   - ✅ Password generation
   - ✅ Username generation
   - ✅ Staff ID generation
   - ✅ Admission number generation
   - ✅ Grading system (A-F: 70-100)
   - ✅ Alternative grading (Percentage-based)
   - ✅ Position/ranking calculation
   - ✅ Performance remarks

### 🚧 To Be Implemented

#### Core Modules (Priority 1)
- [ ] **Users Module** (4 endpoints)
  - CRUD operations
  - Auto-generate credentials on creation
  
- [ ] **Roles Module** (3 endpoints)
  - List roles
  - Create role
  - Update role

- [ ] **Students Module** (7 endpoints)
  - CRUD with auto-generated admission number
  - Get student results
  - Get student attendance

- [ ] **Teachers Module** (11 endpoints)
  - CRUD with auto-generated staff ID
  - Subject/Class assignments
  - Get teacher's classes and subjects

#### Academic Modules (Priority 2)
- [ ] **Classes Module** (11 endpoints)
  - CRUD operations
  - Get class students
  - Get class subjects
  - Subject assignment/removal

- [ ] **Subjects Module** (7 endpoints)
  - CRUD operations
  - Get teachers teaching subject
  - Get classes taking subject

- [ ] **Sessions Module** (4-5 endpoints)
  - CRUD for academic sessions
  - Set current session

- [ ] **Terms Module** (4-5 endpoints)
  - CRUD for terms
  - Set current term

#### Results & Attendance (Priority 3)
- [ ] **Attendance Module** (11 endpoints)
  - Single & bulk attendance marking
  - Student/Class summaries
  - Statistics and reports

- [ ] **Results Module** (18 endpoints)
  - Score entry (single & bulk)
  - Result compilation
  - Grading & ranking
  - Approval & locking
  - Form teacher compilation

#### Reports (Priority 4)
- [ ] **Reports Module** (11 endpoints)
  - Student report cards
  - Class reports
  - Subject performance
  - Dashboard statistics
  - PDF/Excel export

## Database Schema

### Core Tables
- `users` - Authentication and system access
- `roles` - System roles (Admin, Head Teacher, Form Teacher, Subject Teacher)
- `teachers` - Teacher information
- `students` - Student information
- `classes` - Class/arm definitions (e.g., SS1 A)
- `subjects` - Subject definitions

### Academic Tables
- `academic_sessions` - School years (e.g., 2024/2025)
- `terms` - Terms per session (First, Second, Third)
- `class_subjects` - Subjects offered by each class
- `teacher_subject_classes` - Teacher assignments
- `form_teachers` - Form teacher assignments (one per class per session)

### Assessment Tables
- `assessments` - Test types (Test 1, Test 2, Exam) with max scores
- `results` - Individual scores
- `attendance` - Daily attendance records

## API Endpoints Summary

### Authentication (4 endpoints) ✅
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `PATCH /api/auth/change-password`
- `POST /api/auth/request-password-reset`
- `POST /api/auth/reset-password`

### Remaining Endpoints (~75 total)
See design document: `apidesign+backendfolderstructure.txt`

## Getting Started

### Prerequisites
```bash
# Node.js 18+ and npm
node --version
npm --version

# PostgreSQL 15 or 16
psql --version
```

### Installation
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your database credentials
```

### Database Setup
```bash
# Create database
createdb school_db

# Or using psql
psql -U postgres
CREATE DATABASE school_db;
\q

# Run migrations (when database is ready)
npm run migration:run
```

### Running the Application
```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

### Default Port
The server runs on `http://localhost:3000/api`

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=school_db

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRATION=7d

# Password
DEFAULT_PASSWORD_LENGTH=8
PASSWORD_RESET_EXPIRATION=1h
```

## RBAC System

### Roles
1. **Admin** - Full system access
2. **Head Teacher** - Approve results, manage attendance, view all data
3. **Form Teacher** - View class results, add remarks
4. **Subject Teacher** - Enter scores for assigned subjects

### Usage Example
```typescript
@Get()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin', 'Head Teacher')
async getAllStudents() {
  return this.studentsService.findAll();
}
```

## Grading System

### System 1: A-F (70-100 scale)
- **A (70-100):** Excellent
- **B (60-69):** Very Good
- **C (50-59):** Good
- **D (45-49):** Pass
- **E (40-44):** Fair
- **F (0-39):** Fail

### System 2: Percentage-based
- **A+ (90-100):** Outstanding
- **A (80-89):** Excellent
- **B+ (75-79):** Very Good
- **B (70-74):** Good
- **C+ (65-69):** Above Average
- **C (60-64):** Average
- **D (50-59):** Below Average
- **F (0-49):** Fail

## Auto-Generated Credentials

### Teachers
- **Username:** `firstname.lastname{random}` (e.g., `john.doe247`)
- **Staff ID:** `STAFF{YEAR}{4-digit}` (e.g., `STAFF20260001`)
- **Password:** 8-character random (uppercase, lowercase, numbers, special)
- **Must Change Password:** `true` (on first login)

### Students
- **Admission No:** `STU{YEAR}{4-digit}` (e.g., `STU20260001`)
- Similar credential pattern for parent portals (if implemented)

## Ranking/Position Logic

Positions are calculated per class based on **total scores** in descending order:
- Highest total = Position 1
- Handles ties (students with same total get same position)
- Next position skips appropriately (e.g., if two students tie for 1st, next is 3rd)

## Development Notes

### TypeORM Synchronization
- `synchronize: true` in development (auto-creates tables)
- `synchronize: false` in production (use migrations)

### Password Hashing
- Uses `bcrypt` with salt rounds = 10
- Passwords are never stored in plain text

### Token Security
- Access tokens expire in 1 hour
- Refresh tokens expire in 7 days
- Reset tokens expire in 1 hour

## Next Steps

1. **Implement User Module:** Complete CRUD with credential generation
2. **Add Seeder:** Create initial roles and admin user
3. **Implement Student/Teacher Modules:** With all relationship endpoints
4. **Build Academic Modules:** Classes, Subjects, Sessions, Terms
5. **Results System:** Score entry with validation and locking
6. **Reports & PDF:** Generate formatted report cards
7. **Testing:** Unit and E2E tests
8. **Deployment:** Docker configuration and production setup

## Module Template

Each module should follow this structure:
```
src/modules/{module-name}/
├── dto/
│   ├── create-{entity}.dto.ts
│   ├── update-{entity}.dto.ts
│   └── query-{entity}.dto.ts
├── {module-name}.controller.ts
├── {module-name}.service.ts
└── {module-name}.module.ts
```

## Contributing

When adding new modules, ensure:
1. DTOs use class-validator decorators
2. Services use repository pattern
3. Controllers use guards (JwtAuthGuard, RolesGuard)
4. Responses follow ApiResponse format
5. Pagination uses the common helper

## License
ISC

---

**Status:** Foundation Complete ✅ | Modules In Progress 🚧
**Last Updated:** January 20, 2026
