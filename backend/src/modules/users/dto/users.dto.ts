import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsNumber()
  @IsNotEmpty()
  roleId: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  mustChangePassword?: boolean;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsNumber()
  @IsOptional()
  roleId?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class QueryUsersDto {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsNumber()
  @IsOptional()
  roleId?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
