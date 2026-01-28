import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { AttendanceStatus, AttendancePeriod } from '../../../entities/attendance.entity';

class StudentAttendance {
  @IsNumber()
  @IsNotEmpty()
  studentId: number;

  @IsEnum(AttendanceStatus)
  @IsNotEmpty()
  status: AttendanceStatus;
}

export class BulkAttendanceDto {
  @IsNumber()
  @IsNotEmpty()
  classId: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsNumber()
  @IsNotEmpty()
  sessionId: number;

  @IsNumber()
  @IsNotEmpty()
  termId: number;

  @IsEnum(AttendancePeriod)
  @IsOptional()
  period?: AttendancePeriod;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentAttendance)
  attendances: StudentAttendance[];
}
