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
import { Class } from './class.entity';
import { Result } from './result.entity';
import { Attendance } from './attendance.entity';

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
}

export enum StudentStatus {
  ACTIVE = 'Active',
  GRADUATED = 'Graduated',
  TRANSFERRED = 'Transferred',
  SUSPENDED = 'Suspended',
}

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'admission_no', unique: true })
  admissionNo: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth: Date;

  @Column({ name: 'current_class_id' })
  currentClassId: number;

  @ManyToOne(() => Class, { eager: true })
  @JoinColumn({ name: 'current_class_id' })
  currentClass: Class;

  @Column({ name: 'guardian_name', nullable: true })
  guardianName: string;

  @Column({ name: 'guardian_phone', nullable: true })
  guardianPhone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({
    type: 'enum',
    enum: StudentStatus,
    default: StudentStatus.ACTIVE,
  })
  status: StudentStatus;

  @OneToMany(() => Result, (result) => result.student)
  results: Result[];

  @OneToMany(() => Attendance, (attendance) => attendance.student)
  attendance: Attendance[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
