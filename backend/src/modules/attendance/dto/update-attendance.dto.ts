import { IsEnum, IsDateString, IsString, IsOptional } from 'class-validator';
import { AttendanceStatus } from '../../../entities/attendance.entity';

export class UpdateAttendanceDto {
  @IsEnum(AttendanceStatus)
  @IsOptional()
  status?: AttendanceStatus;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  remarks?: string;
}
