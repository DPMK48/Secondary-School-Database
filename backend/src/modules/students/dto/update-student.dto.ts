import { IsString, IsEnum, IsDateString, IsNumber, IsOptional } from 'class-validator';
import { Gender, StudentStatus } from '../../../entities/student.entity';

export class UpdateStudentDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsNumber()
  @IsOptional()
  currentClassId?: number;

  @IsString()
  @IsOptional()
  guardianName?: string;

  @IsString()
  @IsOptional()
  guardianPhone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsEnum(StudentStatus)
  @IsOptional()
  status?: StudentStatus;
}
