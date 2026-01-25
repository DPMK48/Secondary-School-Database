import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateAssessmentDto {
  @IsString()
  @IsNotEmpty()
  name: string; // e.g., "Test 1", "Test 2", "Exam"

  @IsNumber()
  @IsNotEmpty()
  maxScore: number; // e.g., 20, 30, 70

  @IsString()
  @IsOptional()
  description?: string;
}
