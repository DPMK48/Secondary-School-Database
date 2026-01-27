import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { ClassesModule } from './modules/classes/classes.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { TermsModule } from './modules/terms/terms.module';
import { AssessmentsModule } from './modules/assessments/assessments.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { ResultsModule } from './modules/results/results.module';
import { ReportsModule } from './modules/reports/reports.module';
import { HealthModule } from './modules/health/health.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const isProduction = configService.get('NODE_ENV') === 'production';
        
        // Support DATABASE_URL for Supabase/Render deployment
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [path.join(__dirname, '**', '*.entity{.ts,.js}')],
            synchronize: false, // Never sync in production
            logging: !isProduction,
            ssl: isProduction ? { rejectUnauthorized: false } : false,
          };
        }
        
        // Standard configuration for development
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DB_USERNAME', 'postgres'),
          password: configService.get<string>('DB_PASSWORD', 'postgres'),
          database: configService.get<string>('DB_DATABASE', 'school_db'),
          entities: [path.join(__dirname, '**', '*.entity{.ts,.js}')],
          synchronize: configService.get('NODE_ENV') === 'development',
          logging: configService.get('NODE_ENV') === 'development',
        };
      },
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    StudentsModule,
    TeachersModule,
    ClassesModule,
    SubjectsModule,
    SessionsModule,
    TermsModule,
    AssessmentsModule,
    AttendanceModule,
    ResultsModule,
    ReportsModule,
    HealthModule,
    ActivitiesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
