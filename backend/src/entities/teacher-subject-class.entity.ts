import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Teacher } from './teacher.entity';
import { Subject } from './subject.entity';
import { Class } from './class.entity';

@Entity('teacher_subject_classes')
@Unique(['teacherId', 'subjectId', 'classId'])
export class TeacherSubjectClass {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'teacher_id' })
  teacherId: number;

  @ManyToOne(() => Teacher, (teacher) => teacher.assignments)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @Column({ name: 'subject_id' })
  subjectId: number;

  @ManyToOne(() => Subject, (subject) => subject.teacherAssignments)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column({ name: 'class_id' })
  classId: number;

  @ManyToOne(() => Class)
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
