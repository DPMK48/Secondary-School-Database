// Feature-specific student types
import type { Class, Result, Attendance } from '../../types';

export interface StudentFormData {
  admission_no: string;
  first_name: string;
  last_name: string;
  gender: 'Male' | 'Female';
  date_of_birth: string;
  current_class_id: number;
  guardian_name?: string;
  guardian_phone?: string;
  address?: string;
}

export interface StudentWithDetails {
  id: number;
  admission_no: string;
  first_name: string;
  last_name: string;
  gender: 'Male' | 'Female';
  date_of_birth: string;
  current_class_id: number;
  status: 'Active' | 'Graduated' | 'Transferred' | 'Suspended';
  current_class?: Class;
  guardian_name?: string;
  guardian_phone?: string;
  address?: string;
  results?: Result[];
  attendance?: Attendance[];
  attendance_summary?: {
    total_days: number;
    present_days: number;
    absent_days: number;
    late_days: number;
    attendance_percentage: number;
  };
}

export interface StudentFilters {
  search?: string;
  class_id?: number;
  status?: 'Active' | 'Graduated' | 'Transferred' | 'Suspended';
  gender?: 'Male' | 'Female';
  page?: number;
  perPage?: number;
}

export interface StudentBulkUpload {
  file: File;
  class_id: number;
}

export interface StudentTransfer {
  student_id: number;
  from_class_id: number;
  to_class_id: number;
  effective_date: string;
  reason?: string;
}
