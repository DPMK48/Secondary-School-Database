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
import { Class } from './class.entity';
import { Subject } from './subject.entity';

@Entity('class_subjects')
@Unique(['classId', 'subjectId'])
export class ClassSubject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'class_id' })
  classId: number;

  @ManyToOne(() => Class, (cls) => cls.classSubjects)
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @Column({ name: 'subject_id' })
  subjectId: number;

  @ManyToOne(() => Subject, (subject) => subject.classSubjects)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
