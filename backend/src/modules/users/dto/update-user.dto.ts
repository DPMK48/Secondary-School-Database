import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

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

  @IsBoolean()
  @IsOptional()
  mustChangePassword?: boolean;
}
