import { IsString, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateSessionDto {
  @IsString()
  @IsOptional()
  sessionName?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  isCurrent?: boolean;
}
