import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../../entities/user.entity';
import { Student } from '../../entities/student.entity';
import { Teacher } from '../../entities/teacher.entity';
import { Class } from '../../entities/class.entity';
import { FormTeacher } from '../../entities/form-teacher.entity';
import { TeacherSubjectClass } from '../../entities/teacher-subject-class.entity';
import { AcademicSession } from '../../entities/academic-session.entity';
import { Role } from '../../entities/role.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Student, Teacher, Class, FormTeacher, TeacherSubjectClass, AcademicSession, Role]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'your-super-secret-jwt-key'),
        signOptions: {
          expiresIn: '365d', // Admin session lasts 1 year unless logout
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
