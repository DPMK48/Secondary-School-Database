import { IsString, IsNotEmpty, IsEnum, IsDateString, IsNumber, IsOptional } from 'class-validator';
import { Gender } from '../../../entities/student.entity';

export class CreateStudentDto {
  @IsString()
  @IsOptional()
  admissionNo?: string; // Auto-generated if not provided

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @IsNumber()
  @IsNotEmpty()
  currentClassId: number;

  @IsString()
  @IsOptional()
  guardianName?: string;

  @IsString()
  @IsOptional()
  guardianPhone?: string;

  @IsString()
  @IsOptional()
  address?: string;
}
