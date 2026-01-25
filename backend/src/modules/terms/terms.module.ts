import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Term } from '../../entities/term.entity';
import { TermsService } from './terms.service';

@Module({
  imports: [TypeOrmModule.forFeature([Term])],
  providers: [TermsService],
  exports: [TermsService],
})
export class TermsModule {}
