import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { AcademicSession } from './academic-session.entity';
import { Result } from './result.entity';
import { Attendance } from './attendance.entity';

export enum TermName {
  FIRST = 'First Term',
  SECOND = 'Second Term',
  THIRD = 'Third Term',
}

@Entity('terms')
export class Term {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'term_name', type: 'enum', enum: TermName })
  termName: TermName;

  @Column({ name: 'session_id' })
  sessionId: number;

  @ManyToOne(() => AcademicSession, (session) => session.terms)
  @JoinColumn({ name: 'session_id' })
  session: AcademicSession;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'is_current', default: false })
  isCurrent: boolean;

  @OneToMany(() => Result, (result) => result.term)
  results: Result[];

  @OneToMany(() => Attendance, (attendance) => attendance.term)
  attendance: Attendance[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
