import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum ActivityType {
  // Student activities
  STUDENT_ADDED = 'student_added',
  STUDENT_UPDATED = 'student_updated',
  STUDENT_DELETED = 'student_deleted',
  
  // Teacher activities
  TEACHER_ADDED = 'teacher_added',
  TEACHER_UPDATED = 'teacher_updated',
  TEACHER_DELETED = 'teacher_deleted',
  TEACHER_ASSIGNED = 'teacher_assigned',
  
  // Results activities
  RESULT_ENTERED = 'result_entered',
  RESULT_UPDATED = 'result_updated',
  RESULT_PUBLISHED = 'result_published',
  
  // Attendance activities
  ATTENDANCE_MARKED = 'attendance_marked',
  
  // Session/Term activities
  SESSION_CREATED = 'session_created',
  SESSION_ACTIVATED = 'session_activated',
  TERM_CREATED = 'term_created',
  TERM_ACTIVATED = 'term_activated',
  
  // Class activities
  CLASS_CREATED = 'class_created',
  CLASS_UPDATED = 'class_updated',
  
  // Subject activities
  SUBJECT_CREATED = 'subject_created',
  SUBJECT_UPDATED = 'subject_updated',
  
  // Auth activities
  USER_LOGIN = 'user_login',
  PASSWORD_CHANGED = 'password_changed',
}

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  type: ActivityType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'user_id', nullable: true })
  userId: number;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_role', nullable: true })
  userRole: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
