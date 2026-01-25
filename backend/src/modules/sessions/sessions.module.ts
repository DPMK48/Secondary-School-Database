import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicSession } from '../../entities/academic-session.entity';
import { Term } from '../../entities/term.entity';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { TermsService } from '../terms/terms.service';
import { TermsController } from '../terms/terms.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicSession, Term])],
  controllers: [SessionsController, TermsController],
  providers: [SessionsService, TermsService],
  exports: [SessionsService, TermsService],
})
export class SessionsModule {}
