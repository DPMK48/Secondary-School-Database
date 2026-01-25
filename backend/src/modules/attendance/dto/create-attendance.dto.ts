import {
  IsNumber,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsString,
  IsOptional,
} from 'class-validator';
import { AttendanceStatus } from '../../../entities/attendance.entity';

export class CreateAttendanceDto {
  @IsNumber()
  @IsNotEmpty()
  studentId: number;

  @IsNumber()
  @IsNotEmpty()
  classId: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsEnum(AttendanceStatus)
  @IsNotEmpty()
  status: AttendanceStatus;

  @IsNumber()
  @IsNotEmpty()
  sessionId: number;

  @IsNumber()
  @IsNotEmpty()
  termId: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}
