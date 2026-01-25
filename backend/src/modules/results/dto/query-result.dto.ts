import {
  IsNumber,
  IsOptional,
  IsBoolean,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QueryResultDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  studentId?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  subjectId?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  classId?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  teacherId?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sessionId?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  termId?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  assessmentId?: number;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isApproved?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isLocked?: boolean;

  @IsString()
  @IsOptional()
  search?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  perPage?: number = 20;
}
