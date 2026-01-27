export interface JwtPayload {
  sub: number;
  username: string;
  roleId: number;
  roleName: string;
}

export interface AuthResponse {
  access_token: string | null;
  refresh_token: string | null;
  requiresRoleSelection?: boolean;
  availableRoles?: string[];
  user: {
    id: number;
    username: string;
    role: string | null;
    mustChangePassword: boolean;
    teacherId?: number | null;
    studentId?: number | null;
    formTeacherClassId?: number | null;
    formTeacherClassName?: string | null;
  };
}

export interface PasswordResetResponse {
  message: string;
  resetToken?: string; // Only for development
}
