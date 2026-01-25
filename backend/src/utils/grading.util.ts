export interface GradeConfig {
  grade: string;
  min: number;
  max: number;
  remark: string;
}

// Grading System: A-F (70-100 scale)
export const GRADING_SYSTEM_AF: GradeConfig[] = [
  { grade: 'A', min: 70, max: 100, remark: 'Excellent' },
  { grade: 'B', min: 60, max: 69, remark: 'Very Good' },
  { grade: 'C', min: 50, max: 59, remark: 'Good' },
  { grade: 'D', min: 45, max: 49, remark: 'Pass' },
  { grade: 'E', min: 40, max: 44, remark: 'Fair' },
  { grade: 'F', min: 0, max: 39, remark: 'Fail' },
];

// Alternative Grading System (if needed in future)
export const GRADING_SYSTEM_PERCENTAGE: GradeConfig[] = [
  { grade: 'A+', min: 90, max: 100, remark: 'Outstanding' },
  { grade: 'A', min: 80, max: 89, remark: 'Excellent' },
  { grade: 'B+', min: 75, max: 79, remark: 'Very Good' },
  { grade: 'B', min: 70, max: 74, remark: 'Good' },
  { grade: 'C+', min: 65, max: 69, remark: 'Above Average' },
  { grade: 'C', min: 60, max: 64, remark: 'Average' },
  { grade: 'D', min: 50, max: 59, remark: 'Below Average' },
  { grade: 'F', min: 0, max: 49, remark: 'Fail' },
];

/**
 * Get grade based on score
 */
export function getGrade(score: number, system: 'AF' | 'PERCENTAGE' = 'AF'): {
  grade: string;
  remark: string;
} {
  const gradingSystem = system === 'AF' ? GRADING_SYSTEM_AF : GRADING_SYSTEM_PERCENTAGE;
  
  const gradeConfig = gradingSystem.find(
    (config) => score >= config.min && score <= config.max,
  );
  
  return {
    grade: gradeConfig?.grade || 'N/A',
    remark: gradeConfig?.remark || 'Not Applicable',
  };
}

/**
 * Calculate average score
 */
export function calculateAverage(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return Math.round((sum / scores.length) * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate total score
 */
export function calculateTotal(scores: number[]): number {
  return scores.reduce((acc, score) => acc + score, 0);
}

/**
 * Calculate position/rank in class
 */
export function calculatePositions(
  students: Array<{ id: number; total: number }>,
): Array<{ id: number; position: number; total: number }> {
  // Sort by total in descending order
  const sorted = [...students].sort((a, b) => b.total - a.total);
  
  // Assign positions (handle ties)
  let currentPosition = 1;
  let previousTotal = null;
  let studentsWithSameRank = 0;
  
  return sorted.map((student, index) => {
    if (previousTotal !== null && student.total < previousTotal) {
      currentPosition = index + 1;
    }
    
    previousTotal = student.total;
    
    return {
      id: student.id,
      position: currentPosition,
      total: student.total,
    };
  });
}

/**
 * Get overall performance remark based on average
 */
export function getPerformanceRemark(average: number): string {
  if (average >= 70) return 'Outstanding Performance';
  if (average >= 60) return 'Very Good Performance';
  if (average >= 50) return 'Good Performance';
  if (average >= 45) return 'Satisfactory Performance';
  if (average >= 40) return 'Fair Performance';
  return 'Needs Improvement';
}
