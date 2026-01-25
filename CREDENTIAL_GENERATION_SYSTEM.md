# Teacher Credential Generation System

## Overview
This document explains how the automatic teacher credential generation system works in the school management system frontend.

## System Requirements
- Teachers get login credentials **only when first assigned** to a subject/class or as form teacher
- Credentials are **NOT** generated when the teacher record is first created
- Login credentials are automatically **emailed** to the teacher's email address
- Teachers with **both roles** (subject teacher AND form teacher) use the **same login credentials**

## Credential Format

### Username
- Format: Email prefix (part before @)
- Example: `john.doe` (from john.doe@school.com)

### Password
- Format: `SCHOOLCODE@2024`
- Example: `ESS001@2024` (for Excellent Secondary School with code ESS001)

### First Login
- Teachers must change their password on first login
- System flag: `must_change_password: true`

## Frontend Implementation

### Updated Components

#### 1. `/src/types/index.ts`
```typescript
export interface Teacher {
  id: number;
  staff_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  employment_date: string;
  status: 'Active' | 'Inactive';
  user_id?: number | null;           // Optional - set when credentials generated
  has_credentials?: boolean;          // True if login credentials exist
  is_form_teacher?: boolean;          // True if assigned as form teacher
  is_subject_teacher?: boolean;       // True if has subject assignments
}
```

#### 2. `/src/features/teachers/AssignSubjects.tsx`
**Purpose**: Assign subjects and classes to teachers

**Key Features**:
- Checks if teacher has existing credentials (via `user_id`)
- Generates credentials on **first assignment only**
- Shows success notification with email confirmation
- Displays credential status badge

**State Variables**:
```typescript
const [credentialsGenerated, setCredentialsGenerated] = useState(false);
const [teacherHasCredentials, setTeacherHasCredentials] = useState(false);
```

**Logic Flow**:
```typescript
const handleAddAssignment = async (e: React.FormEvent) => {
  // ... validation logic ...
  
  // Check if this is the first assignment
  const isFirstAssignment = !teacherHasCredentials && assignments.length === 0;
  
  if (isFirstAssignment) {
    // TODO: API call to generate credentials
    // await teachersApi.generateCredentials(teacher.id);
    setCredentialsGenerated(true);
    setTeacherHasCredentials(true);
  }
  
  setSuccess(
    isFirstAssignment
      ? 'Assignment added successfully! Login credentials have been generated and sent via email.'
      : 'Assignment added successfully'
  );
};
```

**UI Notification**:
```tsx
{credentialsGenerated && (
  <Alert variant="success">
    <div className="flex items-start gap-2">
      <Mail className="h-5 w-5" />
      <div>
        <p className="font-medium">{success}</p>
        <p className="text-sm mt-1">
          The teacher can now login with their email and will be prompted 
          to change their password on first login.
        </p>
      </div>
    </div>
  </Alert>
)}
```

#### 3. `/src/features/classes/ClassList.tsx`
**Purpose**: Manage classes and assign form teachers

**Key Features**:
- Detects when a teacher without credentials is assigned as form teacher
- Triggers credential generation and email notification
- Shows email sent confirmation

**State Variables**:
```typescript
const [emailSent, setEmailSent] = useState(false);
```

**Logic Flow**:
```typescript
const handleAddClass = async (e: React.FormEvent) => {
  // ... validation and class creation logic ...
  
  // Check if form teacher needs credentials
  const formTeacher = mockTeachers.find(t => t.id === parseInt(formData.form_teacher_id));
  const needsCredentials = formTeacher && !formTeacher.user_id;
  
  if (needsCredentials) {
    // TODO: API call to generate credentials
    // await teachersApi.generateCredentials(formTeacher.id);
    setEmailSent(true);
    
    setTimeout(() => {
      setEmailSent(false);
    }, 5000);
  }
  
  setSuccess('Class added successfully');
};
```

**UI Notification**:
```tsx
{emailSent && (
  <Alert type="success">
    <div className="flex items-center gap-2">
      <Mail className="h-4 w-4" />
      <span>Login credentials have been generated and sent to the teacher's email.</span>
    </div>
  </Alert>
)}
```

## Backend API Requirements

### Endpoint: Generate Teacher Credentials
```
POST /api/teachers/:id/generate-credentials
```

**Request Body**: None (teacher ID from URL parameter)

**Process**:
1. Check if teacher already has `user_id` (credentials exist)
2. If credentials exist, return error
3. Generate username from email prefix
4. Generate password: `SCHOOLCODE@2024`
5. Hash password with bcrypt
6. Create user record in `users` table
7. Update teacher record with `user_id`
8. Send email to teacher with credentials
9. Set `must_change_password: true` flag

**Response**:
```json
{
  "success": true,
  "message": "Credentials generated and sent to teacher's email",
  "data": {
    "username": "john.doe",
    "email_sent": true
  }
}
```

### Email Template
```
Subject: Your School Management System Login Credentials

Dear [Teacher Name],

Your login credentials for the School Management System have been generated:

Username: [username]
Temporary Password: [password]

For security reasons, you will be required to change your password upon first login.

Login URL: [school_portal_url]

If you have any questions, please contact the school administrator.

Best regards,
[School Name] Administration
```

## User Flow Examples

### Scenario 1: New Teacher → Subject Assignment
1. Admin creates teacher record (John Doe, john.doe@school.com)
2. Teacher record saved with `user_id: null`
3. Admin navigates to "Assign Subjects" for John Doe
4. Admin assigns Math → Class 10A
5. **System detects first assignment**
6. Backend generates:
   - Username: `john.doe`
   - Password: `ESS001@2024` (hashed)
7. Email sent to john.doe@school.com
8. UI shows: "Assignment added! Login credentials sent via email."
9. Teacher can now login as **subject_teacher**

### Scenario 2: Existing Subject Teacher → Form Teacher Assignment
1. John Doe already has credentials (is subject teacher)
2. Admin assigns John as Form Teacher for Class 10A
3. **System detects existing credentials** (`user_id` exists)
4. No new credentials generated
5. Teacher role updated to include form teacher access
6. UI shows: "Form teacher assigned successfully"
7. John uses **same credentials** to access both dashboards

### Scenario 3: New Teacher → Form Teacher First
1. Admin creates teacher record (Jane Smith, jane.smith@school.com)
2. Teacher record saved with `user_id: null`
3. Admin assigns Jane as Form Teacher for Class 9B in Classes section
4. **System detects first assignment**
5. Backend generates credentials
6. Email sent to jane.smith@school.com
7. UI shows: "Login credentials sent to teacher's email."
8. Later, admin assigns Jane to teach English
9. **No new credentials** - existing ones used
10. Jane uses same login for both roles

## Database Schema Requirements

### Teachers Table
```sql
CREATE TABLE teachers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  staff_id VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  employment_date DATE,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  user_id INT NULL,  -- References users table
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'subject_teacher', 'form_teacher') NOT NULL,
  must_change_password BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Role Management

### Role Determination Logic
```typescript
// Check teacher assignments to determine role
const determineTeacherRole = (teacher: Teacher) => {
  const hasSubjectAssignments = teacher.is_subject_teacher;
  const isFormTeacher = teacher.is_form_teacher;
  
  if (hasSubjectAssignments && isFormTeacher) {
    return 'both'; // Can access both dashboards
  } else if (isFormTeacher) {
    return 'form_teacher';
  } else if (hasSubjectAssignments) {
    return 'subject_teacher';
  }
  
  return null; // No active role
};
```

### Backend Role Update Logic
```javascript
// When assigning subject
if (!teacher.is_subject_teacher) {
  await updateTeacher(teacherId, { is_subject_teacher: true });
}

// When assigning as form teacher
if (!teacher.is_form_teacher) {
  await updateTeacher(teacherId, { is_form_teacher: true });
}
```

## Security Considerations

1. **Password Strength**: Auto-generated passwords must be changed on first login
2. **Email Verification**: Ensure email is valid before sending credentials
3. **Password Hashing**: Always use bcrypt with appropriate salt rounds (10+)
4. **Token Management**: JWT tokens should include role and school context
5. **Rate Limiting**: Prevent abuse of credential generation endpoint
6. **Audit Trail**: Log all credential generation events

## Testing Checklist

- [ ] Create teacher without generating credentials
- [ ] Assign subject to teacher → credentials generated
- [ ] Verify email sent notification appears
- [ ] Assign same teacher as form teacher → no duplicate credentials
- [ ] Assign form teacher first → credentials generated
- [ ] Then assign subjects → uses existing credentials
- [ ] Verify credential status badge shows correctly
- [ ] Test with multiple schools (different school codes)
- [ ] Test password change on first login
- [ ] Verify teacher can access correct dashboard(s) based on roles

## TODO for Backend Implementation

1. ✅ Frontend credential generation detection logic
2. ✅ Frontend email notification UI
3. ⏳ Create `POST /api/teachers/:id/generate-credentials` endpoint
4. ⏳ Implement email service for credential delivery
5. ⏳ Add first-login password change enforcement
6. ⏳ Create audit log for credential generation events
7. ⏳ Add role-based JWT token generation
8. ⏳ Implement credential regeneration (if needed)

---

Last Updated: [Current Date]
Frontend Status: ✅ Complete
Backend Status: ⏳ Pending Implementation
