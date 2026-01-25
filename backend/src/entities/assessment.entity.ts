import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Result } from './result.entity';

@Entity('assessments')
export class Assessment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // e.g., "Test 1", "Test 2", "Exam"

  @Column({ name: 'max_score', type: 'decimal', precision: 5, scale: 2 })
  maxScore: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => Result, (result) => result.assessment)
  results: Result[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
