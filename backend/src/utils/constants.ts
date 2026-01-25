export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

export const PASSWORD = {
  MIN_LENGTH: 8,
  DEFAULT_LENGTH: 8,
  RESET_EXPIRATION_HOURS: 1,
};

export const JWT = {
  ACCESS_TOKEN_EXPIRATION: '1h',
  REFRESH_TOKEN_EXPIRATION: '7d',
};

export const ROLES = {
  ADMIN: 'Admin',
  FORM_TEACHER: 'Form Teacher',
  SUBJECT_TEACHER: 'Subject Teacher',
};

export const CLASS_LEVELS = {
  JUNIOR: 'Junior',
  SENIOR: 'Senior',
};

export const CLASS_ARMS = ['A', 'B', 'C', 'D'];

export const STUDENT_STATUS = {
  ACTIVE: 'Active',
  GRADUATED: 'Graduated',
  TRANSFERRED: 'Transferred',
  SUSPENDED: 'Suspended',
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LATE: 'Late',
  EXCUSED: 'Excused',
};

export const TERM_NAMES = {
  FIRST: 'First Term',
  SECOND: 'Second Term',
  THIRD: 'Third Term',
};
