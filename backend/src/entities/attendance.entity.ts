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
import { Class } from './class.entity';
import { AcademicSession } from './academic-session.entity';
import { Term } from './term.entity';

export enum AttendanceStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  LATE = 'Late',
  EXCUSED = 'Excused',
}

export enum AttendancePeriod {
  MORNING = 'Morning',
  AFTERNOON = 'Afternoon',
}

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @ManyToOne(() => Student, (student) => student.attendance)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'class_id' })
  classId: number;

  @ManyToOne(() => Class, (cls) => cls.attendance)
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'enum', enum: AttendanceStatus })
  status: AttendanceStatus;

  @Column({ type: 'enum', enum: AttendancePeriod, default: AttendancePeriod.MORNING })
  period: AttendancePeriod;

  @Column({ name: 'session_id' })
  sessionId: number;

  @ManyToOne(() => AcademicSession, (session) => session.attendance)
  @JoinColumn({ name: 'session_id' })
  session: AcademicSession;

  @Column({ name: 'term_id' })
  termId: number;

  @ManyToOne(() => Term, (term) => term.attendance)
  @JoinColumn({ name: 'term_id' })
  term: Term;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
