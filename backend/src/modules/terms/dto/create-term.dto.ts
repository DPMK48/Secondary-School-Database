import { IsEnum, IsNotEmpty, IsNumber, IsDateString, IsBoolean, IsOptional } from 'class-validator';
import { TermName } from '../../../entities/term.entity';

export class CreateTermDto {
  @IsEnum(TermName)
  @IsNotEmpty()
  termName: TermName;

  @IsNumber()
  @IsNotEmpty()
  sessionId: number;

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
