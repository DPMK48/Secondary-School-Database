import { IsString, IsEnum, IsOptional } from 'class-validator';

export class UpdateSubjectDto {
  @IsString()
  @IsOptional()
  subjectName?: string;

  @IsString()
  @IsOptional()
  subjectCode?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['Junior', 'Senior'])
  level?: string;
}
