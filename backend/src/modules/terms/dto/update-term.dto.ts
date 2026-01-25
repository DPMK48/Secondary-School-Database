import { IsEnum, IsDateString, IsBoolean, IsOptional } from 'class-validator';
import { TermName } from '../../../entities/term.entity';

export class UpdateTermDto {
  @IsEnum(TermName)
  @IsOptional()
  termName?: TermName;

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
