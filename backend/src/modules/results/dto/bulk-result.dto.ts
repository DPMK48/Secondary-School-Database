import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';

class ScoreEntry {
  @IsNumber()
  @IsNotEmpty()
  studentId: number;

  @IsNumber()
  @IsNotEmpty()
  score: number;
}

export class BulkResultDto {
  @IsNumber()
  @IsNotEmpty()
  subjectId: number;

  @IsNumber()
  @IsNotEmpty()
  classId: number;

  @IsNumber()
  @IsNotEmpty()
  teacherId: number;

  @IsNumber()
  @IsNotEmpty()
  sessionId: number;

  @IsNumber()
  @IsNotEmpty()
  termId: number;

  @IsNumber()
  @IsNotEmpty()
  assessmentId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScoreEntry)
  scores: ScoreEntry[];
}
