import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ClassLevel, ClassArm } from '../../../entities/class.entity';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  className: string; // e.g., "JSS1", "SS2"

  @IsEnum(ClassArm)
  @IsNotEmpty()
  arm: ClassArm;

  @IsEnum(ClassLevel)
  @IsNotEmpty()
  level: ClassLevel;

  @IsNumber()
  @IsOptional()
  formTeacherId?: number;
}
