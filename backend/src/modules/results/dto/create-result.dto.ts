import { IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateResultDto {
  @IsNumber()
  @IsNotEmpty()
  studentId: number;

  @IsNumber()
  @IsNotEmpty()
  subjectId: number;

  @IsNumber()
  @IsNotEmpty()
  classId: number;

  @IsNumber()
  @IsNotEmpty()
  teacherId: number;

  @IsNumber()
  @IsNotEmpty()
  sessionId: number;

  @IsNumber()
  @IsNotEmpty()
  termId: number;

  @IsNumber()
  @IsNotEmpty()
  assessmentId: number;

  @IsNumber()
  @IsNotEmpty()
  score: number;
}
