import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Student } from './student.entity';
import { ClassSubject } from './class-subject.entity';
import { FormTeacher } from './form-teacher.entity';
import { Result } from './result.entity';
import { Attendance } from './attendance.entity';

export enum ClassLevel {
  JUNIOR = 'Junior',
  SENIOR = 'Senior',
}

export enum ClassArm {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
}

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'class_name' })
  className: string; // e.g., JSS1, SS2

  @Column({ type: 'enum', enum: ClassArm })
  arm: ClassArm;

  @Column({ type: 'enum', enum: ClassLevel })
  level: ClassLevel;

  @OneToMany(() => Student, (student) => student.currentClass)
  students: Student[];

  @OneToMany(() => ClassSubject, (cs) => cs.class)
  classSubjects: ClassSubject[];

  @OneToMany(() => FormTeacher, (ft) => ft.class)
  formTeachers: FormTeacher[];

  @OneToMany(() => Result, (result) => result.class)
  results: Result[];

  @OneToMany(() => Attendance, (attendance) => attendance.class)
  attendance: Attendance[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
