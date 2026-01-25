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
import { Class } from './class.entity';
import { AcademicSession } from './academic-session.entity';

@Entity('form_teachers')
@Unique(['classId', 'sessionId'])
export class FormTeacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'teacher_id' })
  teacherId: number;

  @ManyToOne(() => Teacher, (teacher) => teacher.formTeacherAssignments)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @Column({ name: 'class_id' })
  classId: number;

  @ManyToOne(() => Class, (cls) => cls.formTeachers)
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @Column({ name: 'session_id' })
  sessionId: number;

  @ManyToOne(() => AcademicSession, (session) => session.formTeachers)
  @JoinColumn({ name: 'session_id' })
  session: AcademicSession;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
