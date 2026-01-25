import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  username?: string; // Will be auto-generated if not provided

  @IsString()
  @IsOptional()
  password?: string; // Will be auto-generated if not provided

  @IsNumber()
  @IsNotEmpty()
  roleId: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsBoolean()
  @IsOptional()
  mustChangePassword?: boolean = true;
}
