// Feature-specific auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'form_teacher' | 'subject_teacher';
    is_active: boolean;
    created_at: string;
  };
  access_token: string;
  token_type: string;
}

export interface AuthError {
  message: string;
  status: number;
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
}
