/**
 * Generate a random password
 */
export function generatePassword(length: number = 8): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  
  const allChars = uppercase + lowercase + numbers + special;
  let password = '';
  
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
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
