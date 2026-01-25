import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ResultsService } from './results.service';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { BulkResultDto } from './dto/bulk-result.dto';
import { QueryResultDto } from './dto/query-result.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('results')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Post()
  @Roles('Admin', 'Form Teacher', 'Subject Teacher')
  create(@Body() createResultDto: CreateResultDto) {
    return this.resultsService.create(createResultDto);
  }

  @Post('bulk')
  @Roles('Admin', 'Form Teacher', 'Subject Teacher')
  bulkCreate(@Body() bulkResultDto: BulkResultDto) {
    return this.resultsService.bulkCreate(bulkResultDto);
  }

  @Get()
  @Roles('Admin', 'Form Teacher', 'Subject Teacher')
  findAll(@Query() query: QueryResultDto) {
    return this.resultsService.findAll(query);
  }

  @Get('statistics')
  @Roles('Admin')
  getStatistics(
    @Query('sessionId', ParseIntPipe) sessionId?: number,
    @Query('termId', ParseIntPipe) termId?: number,
  ) {
    return this.resultsService.getStatistics(sessionId, termId);
  }

  @Get('student/:studentId')
  @Roles('Admin', 'Form Teacher', 'Subject Teacher')
  getStudentResults(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('termId', ParseIntPipe) termId: number,
    @Query('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return this.resultsService.getStudentResults(studentId, termId, sessionId);
  }

  @Get('class/:classId/subject/:subjectId')
  @Roles('Admin', 'Form Teacher', 'Subject Teacher')
  getClassResults(
    @Param('classId', ParseIntPipe) classId: number,
    @Param('subjectId', ParseIntPipe) subjectId: number,
    @Query('termId', ParseIntPipe) termId: number,
    @Query('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return this.resultsService.getClassResults(classId, subjectId, termId, sessionId);
  }

  @Get('form-teacher/:classId')
  @Roles('Admin', 'Form Teacher')
  getFormTeacherCompilation(
    @Param('classId', ParseIntPipe) classId: number,
    @Query('termId', ParseIntPipe) termId: number,
    @Query('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return this.resultsService.getFormTeacherCompilation(classId, termId, sessionId);
  }

  @Post('approve')
  @Roles('Admin')
  approveResults(
    @Body('classId', ParseIntPipe) classId: number,
    @Body('subjectId', ParseIntPipe) subjectId: number,
    @Body('termId', ParseIntPipe) termId: number,
  ) {
    return this.resultsService.approveResults(classId, subjectId, termId);
  }

  @Post('lock')
  @Roles('Admin')
  lockResults(
    @Body('classId', ParseIntPipe) classId: number,
    @Body('termId', ParseIntPipe) termId: number,
  ) {
    return this.resultsService.lockResults(classId, termId);
  }

  @Post('unlock')
  @Roles('Admin')
  unlockResults(
    @Body('classId', ParseIntPipe) classId: number,
    @Body('termId', ParseIntPipe) termId: number,
  ) {
    return this.resultsService.unlockResults(classId, termId);
  }

  @Get(':id')
  @Roles('Admin', 'Form Teacher', 'Subject Teacher')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.resultsService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin', 'Form Teacher', 'Subject Teacher')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateResultDto: UpdateResultDto,
  ) {
    return this.resultsService.update(id, updateResultDto);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.resultsService.remove(id);
  }
}
