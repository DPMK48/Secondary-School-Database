import { IsString, IsNotEmpty, IsNumber, IsEmail, IsOptional, IsDateString } from 'class-validator';

export class CreateTeacherDto {
  @IsNumber()
  @IsOptional()
  userId?: number;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  staffId?: string; // Auto-generated if not provided

  @IsString()
  @IsOptional()
  address?: string;

  @IsDateString()
  @IsOptional()
  employmentDate?: string;
}
