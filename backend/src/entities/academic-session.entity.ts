import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Term } from './term.entity';
import { Result } from './result.entity';
import { Attendance } from './attendance.entity';
import { FormTeacher } from './form-teacher.entity';

@Entity('academic_sessions')
export class AcademicSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'session_name', unique: true })
  sessionName: string; // e.g., "2024/2025"

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'is_current', default: false })
  isCurrent: boolean;

  @OneToMany(() => Term, (term) => term.session)
  terms: Term[];

  @OneToMany(() => Result, (result) => result.session)
  results: Result[];

  @OneToMany(() => Attendance, (attendance) => attendance.session)
  attendance: Attendance[];

  @OneToMany(() => FormTeacher, (ft) => ft.session)
  formTeachers: FormTeacher[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
