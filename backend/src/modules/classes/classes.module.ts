import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from '../../entities/class.entity';
import { ClassSubject } from '../../entities/class-subject.entity';
import { Student } from '../../entities/student.entity';
import { FormTeacher } from '../../entities/form-teacher.entity';
import { Teacher } from '../../entities/teacher.entity';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { AcademicSession } from '../../entities/academic-session.entity';
import { TeacherSubjectClass } from '../../entities/teacher-subject-class.entity';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Class,
      ClassSubject,
      Student,
      FormTeacher,
      Teacher,
      User,
      Role,
      AcademicSession,
      TeacherSubjectClass,
    ]),
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
