import {
  IsNumber,
  IsOptional,
  IsDateString,
  IsEnum,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '../../../entities/attendance.entity';

export class QueryAttendanceDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  studentId?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  classId?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sessionId?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  termId?: number;

  @IsEnum(AttendanceStatus)
  @IsOptional()
  status?: AttendanceStatus;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

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
