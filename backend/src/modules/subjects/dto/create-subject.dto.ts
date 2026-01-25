import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  subjectName: string;

  @IsString()
  @IsNotEmpty()
  subjectCode: string;

  @IsOptional()
  @IsEnum(['Junior', 'Senior'])
  @Transform(({ value }) => (value === '' || value === 'All') ? undefined : value)
  level?: string;
}
