# Quick Start Guide

## 1. Database Setup

### Create PostgreSQL Database
```bash
# Using createdb command
createdb school_db

# Or using psql
psql -U postgres
CREATE DATABASE school_db;
\q
```

### Update Environment Variables
```bash
# Copy example environment file
cp .env.example .env

# Edit .env and update these values:
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_DATABASE=school_db

# Update JWT secrets (important for production!)
JWT_SECRET=change-this-to-a-long-random-string
JWT_REFRESH_SECRET=change-this-to-another-long-random-string
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Seed the Database

```bash
# This creates roles and an admin user
npm run seed
```

**Default Admin Credentials:**
- Username: `admin`
- Password: `Admin@123`
- **⚠️ Change this password immediately after first login!**

## 4. Start the Server

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at: `http://localhost:3000/api`

## 5. Test the API

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@123"
  }'
```

You'll receive a response with `access_token` and `refresh_token`.

### Get Current User
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create a New User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teacher1",
    "roleId": 4,
    "isActive": true
  }'
```

The system will auto-generate a password and return it in the response.

## 6. Common Commands

```bash
# Start development server
npm run start:dev

# Build for production
npm run build

# Run tests
npm test

# Seed database
npm run seed

# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

## 7. Project Structure

```
src/
├── config/           # TypeORM and app configuration
├── database/         # Seeders and migrations
├── entities/         # TypeORM entities (14 tables)
├── modules/          # Feature modules
│   ├── auth/         # ✅ Authentication (JWT, RBAC)
│   └── users/        # ✅ User management
├── common/           # Shared utilities
│   ├── dto/          # Common DTOs (Pagination)
│   └── helpers/      # Helper functions
├── utils/            # Utility functions
│   ├── constants.ts  # App constants
│   ├── generators.ts # Password, ID generators
│   └── grading.ts    # Grading & ranking logic
├── app.module.ts     # Root module
└── main.ts           # Application entry point
```

## 8. Next Steps

### Priority 1: Core Modules
- [ ] Implement Students Module
- [ ] Implement Teachers Module
- [ ] Implement Roles Module (basic CRUD)

### Priority 2: Academic Setup
- [ ] Implement Classes Module
- [ ] Implement Subjects Module
- [ ] Implement Sessions Module
- [ ] Implement Terms Module
- [ ] Implement Assessments Module

### Priority 3: Operations
- [ ] Implement Attendance Module
- [ ] Implement Results Module
- [ ] Implement Form Teacher assignments

### Priority 4: Reporting
- [ ] Implement Reports Module
- [ ] PDF generation for report cards
- [ ] Excel exports

## 9. API Testing with Postman

1. Import the API endpoints
2. Create an environment with:
   - `base_url`: `http://localhost:3000/api`
   - `access_token`: (set after login)
3. Use Bearer token authentication

## 10. Troubleshooting

### Database Connection Error
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001
```

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 11. Development Tips

### Watch Mode
The `npm run start:dev` command watches for file changes and auto-reloads.

### Database Schema Changes
- In development: TypeORM auto-syncs schema changes
- In production: Use migrations

### Adding New Modules
Follow the pattern in `src/modules/users/` as a template:
1. Create module directory
2. Add DTOs (validation)
3. Create service (business logic)
4. Create controller (endpoints)
5. Create module file
6. Import in app.module.ts

---

**Ready to build!** 🚀

For detailed documentation, see [README.md](README.md)
