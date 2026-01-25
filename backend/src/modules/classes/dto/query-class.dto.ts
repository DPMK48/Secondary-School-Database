import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ClassLevel } from '../../../entities/class.entity';

export class QueryClassDto {
  @IsOptional()
  @IsEnum(ClassLevel)
  level?: ClassLevel;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  perPage?: number = 20;
}
