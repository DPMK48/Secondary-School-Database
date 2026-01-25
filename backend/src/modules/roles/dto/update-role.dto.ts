import { IsString, IsOptional } from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  roleName?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
