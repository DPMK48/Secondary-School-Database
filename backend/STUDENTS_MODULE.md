# Students Module - API Testing Guide

## Base URL
```
http://localhost:3000/api
```

## Authentication Required
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_token>
```

## Students Endpoints

### 1. Create Student
**POST** `/students`

**Roles:** Admin, Head Teacher

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "gender": "Male",
  "dateOfBirth": "2010-05-15",
  "currentClassId": 1,
  "guardianName": "Jane Doe",
  "guardianPhone": "+234 801 234 5678",
  "address": "123 Main Street, Lagos"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "admissionNo": "STU20260001",
    "firstName": "John",
    "lastName": "Doe",
    "gender": "Male",
    "dateOfBirth": "2010-05-15",
    "currentClassId": 1,
    "currentClass": {
      "id": 1,
      "className": "JSS1",
      "arm": "A"
    },
    "guardianName": "Jane Doe",
    "guardianPhone": "+234 801 234 5678",
    "address": "123 Main Street, Lagos",
    "status": "Active",
    "createdAt": "2026-01-20T10:00:00.000Z"
  },
  "message": "Student created successfully"
}
```

### 2. Get All Students (with filters)
**GET** `/students?page=1&perPage=20&classId=1&status=Active&search=John`

**Roles:** Admin, Head Teacher, Form Teacher, Subject Teacher

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `perPage` (optional): Items per page (default: 20)
- `classId` (optional): Filter by class ID
- `status` (optional): Filter by status (Active, Graduated, etc.)
- `search` (optional): Search by name or admission number

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "admissionNo": "STU20260001",
      "firstName": "John",
      "lastName": "Doe",
      "gender": "Male",
      "currentClass": {
        "id": 1,
        "className": "JSS1",
        "arm": "A"
      },
      "status": "Active"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "perPage": 20,
    "totalPages": 1
  }
}
```

### 3. Get Single Student
**GET** `/students/:id`

**Roles:** Admin, Head Teacher, Form Teacher, Subject Teacher

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "admissionNo": "STU20260001",
    "firstName": "John",
    "lastName": "Doe",
    "gender": "Male",
    "dateOfBirth": "2010-05-15",
    "currentClass": {
      "id": 1,
      "className": "JSS1",
      "arm": "A",
      "level": "Junior"
    },
    "guardianName": "Jane Doe",
    "guardianPhone": "+234 801 234 5678",
    "address": "123 Main Street, Lagos",
    "status": "Active"
  }
}
```

### 4. Update Student
**PATCH** `/students/:id`

**Roles:** Admin, Head Teacher

**Request Body:** (all fields optional)
```json
{
  "firstName": "John Updated",
  "guardianPhone": "+234 802 345 6789",
  "status": "Active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "firstName": "John Updated",
    "lastName": "Doe",
    ...
  },
  "message": "Student updated successfully"
}
```

### 5. Delete Student
**DELETE** `/students/:id`

**Roles:** Admin, Head Teacher

**Response:**
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

### 6. Get Student Results
**GET** `/students/:id/results?term_id=1&session_id=1`

**Roles:** Admin, Head Teacher, Form Teacher, Subject Teacher

**Query Parameters:**
- `term_id` (optional): Filter by term
- `session_id` (optional): Filter by session

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "score": 85,
      "subject": {
        "id": 1,
        "subjectName": "Mathematics"
      },
      "assessment": {
        "id": 1,
        "name": "Test 1",
        "maxScore": 30
      }
    }
  ]
}
```

### 7. Get Student Attendance
**GET** `/students/:id/attendance?term_id=1&session_id=1`

**Roles:** Admin, Head Teacher, Form Teacher

**Query Parameters:**
- `term_id` (optional): Filter by term
- `session_id` (optional): Filter by session

**Response:**
```json
{
  "success": true,
  "data": {
    "attendance": [
      {
        "id": 1,
        "date": "2026-01-15",
        "status": "Present"
      }
    ],
    "summary": {
      "total": 20,
      "present": 18,
      "absent": 1,
      "late": 1,
      "excused": 0
    }
  }
}
```

## Frontend Integration

### API Service (Already exists in your frontend)
```typescript
// src/features/students/students.api.ts
import api from '../../services/axios';

export const studentsApi = {
  getAll: (filters) => api.get('/students', { params: filters }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  getResults: (id, params) => api.get(`/students/${id}/results`, { params }),
  getAttendance: (id, params) => api.get(`/students/${id}/attendance`, { params }),
};
```

### Testing with cURL

```bash
# Login first to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'

# Create student
curl -X POST http://localhost:3000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "gender": "Male",
    "dateOfBirth": "2010-05-15",
    "currentClassId": 1
  }'

# Get all students
curl -X GET "http://localhost:3000/api/students?page=1&perPage=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Error Responses

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Student with ID 999 not found",
  "error": "Not Found"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid token or user not found",
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

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Admission number already exists",
  "error": "Conflict"
}
```

## Notes

1. **Admission Number:** Auto-generated if not provided (format: STU{YEAR}{4-digits})
2. **Pagination:** Default 20 items per page, max 100
3. **Search:** Searches in firstName, lastName, and admissionNo (case-insensitive)
4. **Status Values:** Active, Graduated, Transferred, Suspended
5. **Gender Values:** Male, Female
