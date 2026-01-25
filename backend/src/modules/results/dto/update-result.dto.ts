import { IsNumber, IsOptional } from 'class-validator';

export class UpdateResultDto {
  @IsNumber()
  @IsOptional()
  score?: number;
}
