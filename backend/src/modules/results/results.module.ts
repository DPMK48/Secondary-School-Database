import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Result } from '../../entities/result.entity';
import { Assessment } from '../../entities/assessment.entity';
import { ResultsService } from './results.service';
import { ResultsController } from './results.controller';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Result, Assessment]),
    ActivitiesModule,
  ],
  controllers: [ResultsController],
  providers: [ResultsService],
  exports: [ResultsService],
})
export class ResultsModule {}
