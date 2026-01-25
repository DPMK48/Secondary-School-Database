import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { ClassLevel, ClassArm } from '../../../entities/class.entity';

export class UpdateClassDto {
  @IsString()
  @IsOptional()
  className?: string;

  @IsEnum(ClassArm)
  @IsOptional()
  arm?: ClassArm;

  @IsEnum(ClassLevel)
  @IsOptional()
  level?: ClassLevel;

  @IsNumber()
  @IsOptional()
  formTeacherId?: number;
}
