import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  roleName: string;

  @IsString()
  @IsOptional()
  description?: string;
}
