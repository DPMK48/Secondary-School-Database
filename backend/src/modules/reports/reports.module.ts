import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Result } from '../../entities/result.entity';
import { Attendance } from '../../entities/attendance.entity';
import { Student } from '../../entities/student.entity';
import { Class } from '../../entities/class.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Result, Attendance, Student, Class])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
