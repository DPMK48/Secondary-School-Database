import { IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryUserDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  roleId?: number;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsString()
  @IsOptional()
  search?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  perPage?: number = 20;
}
