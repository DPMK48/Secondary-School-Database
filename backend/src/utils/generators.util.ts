/**
 * Generate a password in the format: SCHOOLCODE@2024
 * This follows the credential generation system specification
 */
export function generatePassword(): string {
  const schoolCode = process.env.SCHOOL_CODE || 'ESS001';
  const year = new Date().getFullYear();
  return `${schoolCode}@${year}`;
}

/**
 * Generate a username from first and last name
 * Format: firstname.lastname (all lowercase, spaces/special chars removed)
 */
export function generateUsername(firstName: string, lastName: string): string {
  // Clean and format names - remove special characters and spaces
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '');
  
  return `${cleanFirst}.${cleanLast}`;
}

/**
 * Generate staff ID
 */
export function generateStaffId(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `STAFF${year}${randomNum}`;
}

/**
 * Generate admission number
 */
export function generateAdmissionNo(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `STU${year}${randomNum}`;
}
