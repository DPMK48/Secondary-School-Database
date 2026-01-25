import { IsNumber, IsNotEmpty } from 'class-validator';

export class AssignSubjectClassDto {
  @IsNumber()
  @IsNotEmpty()
  teacherId: number;

  @IsNumber()
  @IsNotEmpty()
  subjectId: number;

  @IsNumber()
  @IsNotEmpty()
  classId: number;
}
