# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer {access_token}
```

---

## Authentication Endpoints

### POST /auth/login
Login to the system

**Request Body:**
```json
{
  "username": "admin",
  "password": "Admin@123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "Admin",
    "mustChangePassword": false
  }
}
```

### POST /auth/refresh
Refresh access token

**Headers:** `Authorization: Bearer {refresh_token}`

**Response:** `200 OK`
```json
{
  "access_token": "new_access_token_here"
}
```

### GET /auth/me
Get current user information

**Headers:** `Authorization: Bearer {access_token}`

**Response:** `200 OK`
```json
{
  "id": 1,
  "username": "admin",
  "role": "Admin",
  "roleId": 1,
  "isActive": true,
  "mustChangePassword": false
}
```

### PATCH /auth/change-password
Change own password

**Headers:** `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
  "oldPassword": "Admin@123",
  "newPassword": "NewSecurePass@123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password changed successfully"
}
```

### POST /auth/request-password-reset
Request password reset token

**Request Body:**
```json
{
  "username": "john.doe"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset token generated",
  "resetToken": "abc123..." // Only in development
}
```

### POST /auth/reset-password
Reset password using token

**Request Body:**
```json
{
  "token": "reset_token_here",
  "newPassword": "NewPassword@123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset successfully"
}
```

---

## Users Endpoints

### POST /users
Create a new user (Admin, Head Teacher only)

**Headers:** `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
  "username": "teacher.john",
  "roleId": 4,
  "isActive": true
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": 2,
    "username": "teacher.john",
    "roleId": 4,
    "isActive": true,
    "mustChangePassword": true,
    "createdAt": "2026-01-20T10:00:00.000Z"
  },
  "generatedPassword": "Abc@1234"
}
```

### GET /users
Get all users with pagination

**Headers:** `Authorization: Bearer {access_token}`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `roleId` (optional): Filter by role ID
- `isActive` (optional): Filter by active status

**Example:** `/users?page=1&limit=10&roleId=4`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "username": "admin",
      "roleId": 1,
      "role": {
        "id": 1,
        "roleName": "Admin"
      },
      "isActive": true,
      "mustChangePassword": false
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

### GET /users/:id
Get single user by ID

**Headers:** `Authorization: Bearer {access_token}`

**Response:** `200 OK`
```json
{
  "id": 1,
  "username": "admin",
  "roleId": 1,
  "role": {
    "id": 1,
    "roleName": "Admin",
    "description": "Full system access"
  },
  "isActive": true,
  "mustChangePassword": false
}
```

### PATCH /users/:id
Update user

**Headers:** `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
  "username": "new.username",
  "roleId": 2,
  "isActive": false
}
```

**Response:** `200 OK`
```json
{
  "id": 2,
  "username": "new.username",
  "roleId": 2,
  "isActive": false,
  "updatedAt": "2026-01-20T11:00:00.000Z"
}
```

### DELETE /users/:id
Delete user (Admin only)

**Headers:** `Authorization: Bearer {access_token}`

**Response:** `200 OK`
```json
{
  "message": "User with ID 2 has been deleted"
}
```

### POST /users/:id/reset-password
Reset user password (Admin, Head Teacher only)

**Headers:** `Authorization: Bearer {access_token}`

**Response:** `200 OK`
```json
{
  "newPassword": "Gen3r@ted"
}
```

---

## Role-Based Access Control

### Roles and Permissions

| Role | Create Users | Manage Results | Approve Results | Enter Scores |
|------|-------------|----------------|-----------------|--------------|
| Admin | ✅ | ✅ | ✅ | ✅ |
| Head Teacher | ✅ | ✅ | ✅ | ❌ |
| Form Teacher | ❌ | View Only | ❌ | ❌ |
| Subject Teacher | ❌ | Own Classes | ❌ | ✅ |

### Role IDs
1. Admin
2. Head Teacher
3. Form Teacher
4. Subject Teacher

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User with ID 999 not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Username already exists",
  "error": "Conflict"
}
```

---

## Common Query Parameters

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

### Filtering
Most list endpoints support filtering by:
- Related IDs (e.g., `classId`, `studentId`)
- Status fields
- Date ranges

### Example
```
GET /students?page=2&limit=10&classId=5&status=Active
```

---

## Status Codes

- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict
- `500 Internal Server Error`: Server error

---

## Upcoming Endpoints

### Students Module
- `GET /students`
- `POST /students`
- `GET /students/:id`
- `PATCH /students/:id`
- `DELETE /students/:id`
- `GET /students/:id/results`
- `GET /students/:id/attendance`

### Teachers Module
- `GET /teachers`
- `POST /teachers`
- `GET /teachers/:id`
- `PATCH /teachers/:id`
- `DELETE /teachers/:id`
- `GET /teachers/:id/subjects`
- `GET /teachers/:id/classes`
- `POST /teachers/assign`
- `DELETE /teachers/assign/:id`

### Classes Module
- `GET /classes`
- `POST /classes`
- And more...

See [apidesign+backendfolderstructure.txt](../apidesign+backendfolderstructure.txt) for complete endpoint list.

---

**Version:** 1.0.0  
**Last Updated:** January 20, 2026
