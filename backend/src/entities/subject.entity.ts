import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ClassSubject } from './class-subject.entity';
import { TeacherSubjectClass } from './teacher-subject-class.entity';
import { Result } from './result.entity';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'subject_name' })
  subjectName: string;

  @Column({ name: 'subject_code', unique: true })
  subjectCode: string;

  @Column({ type: 'enum', enum: ['Junior', 'Senior'], nullable: true })
  level: string;

  @OneToMany(() => ClassSubject, (cs) => cs.subject)
  classSubjects: ClassSubject[];

  @OneToMany(() => TeacherSubjectClass, (tsc) => tsc.subject)
  teacherAssignments: TeacherSubjectClass[];

  @OneToMany(() => Result, (result) => result.subject)
  results: Result[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
