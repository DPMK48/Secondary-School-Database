import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QuerySubjectDto {
  @IsOptional()
  @IsEnum(['Junior', 'Senior'])
  @Transform(({ value }) => value === '' ? undefined : value)
  level?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === '' ? undefined : value)
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
