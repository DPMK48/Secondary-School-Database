import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Student } from './student.entity';
import { Subject } from './subject.entity';
import { Class } from './class.entity';
import { Teacher } from './teacher.entity';
import { AcademicSession } from './academic-session.entity';
import { Term } from './term.entity';
import { Assessment } from './assessment.entity';

@Entity('results')
export class Result {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @ManyToOne(() => Student, (student) => student.results)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'subject_id' })
  subjectId: number;

  @ManyToOne(() => Subject, (subject) => subject.results)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column({ name: 'class_id' })
  classId: number;

  @ManyToOne(() => Class, (cls) => cls.results)
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @Column({ name: 'teacher_id' })
  teacherId: number;

  @ManyToOne(() => Teacher)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @Column({ name: 'session_id' })
  sessionId: number;

  @ManyToOne(() => AcademicSession, (session) => session.results)
  @JoinColumn({ name: 'session_id' })
  session: AcademicSession;

  @Column({ name: 'term_id' })
  termId: number;

  @ManyToOne(() => Term, (term) => term.results)
  @JoinColumn({ name: 'term_id' })
  term: Term;

  @Column({ name: 'assessment_id' })
  assessmentId: number;

  @ManyToOne(() => Assessment, (assessment) => assessment.results)
  @JoinColumn({ name: 'assessment_id' })
  assessment: Assessment;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column({ name: 'is_approved', default: false })
  isApproved: boolean;

  @Column({ name: 'is_locked', default: false })
  isLocked: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
