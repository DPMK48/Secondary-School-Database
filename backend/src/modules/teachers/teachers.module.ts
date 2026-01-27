import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from '../../entities/teacher.entity';
import { TeacherSubjectClass } from '../../entities/teacher-subject-class.entity';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Teacher, TeacherSubjectClass, User, Role]),
    ActivitiesModule,
  ],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [TeachersService],
})
export class TeachersModule {}
