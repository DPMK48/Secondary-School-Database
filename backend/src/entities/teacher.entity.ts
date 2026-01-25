import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { TeacherSubjectClass } from './teacher-subject-class.entity';
import { FormTeacher } from './form-teacher.entity';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', unique: true })
  userId: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ unique: true })
  phone: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'staff_id', unique: true, nullable: true })
  staffId: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ name: 'employment_date', type: 'date', nullable: true })
  employmentDate: Date;

  @Column({ default: 'Active' })
  status: string;

  @OneToMany(() => TeacherSubjectClass, (tsc) => tsc.teacher)
  assignments: TeacherSubjectClass[];

  @OneToMany(() => FormTeacher, (ft) => ft.teacher)
  formTeacherAssignments: FormTeacher[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
