import { IsString, IsNotEmpty, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  sessionName: string; // e.g., "2024/2025"

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsBoolean()
  @IsOptional()
  isCurrent?: boolean;
}
