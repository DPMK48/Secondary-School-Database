import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateAssessmentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  maxScore?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
