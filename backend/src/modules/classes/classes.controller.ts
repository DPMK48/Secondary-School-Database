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
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { QueryClassDto } from './dto/query-class.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @Roles('Admin')
  create(@Body() createClassDto: CreateClassDto) {
    return this.classesService.create(createClassDto);
  }

  @Get()
  @Roles('Admin', 'Form Teacher', 'Subject Teacher')
  findAll(@Query() query: QueryClassDto) {
    return this.classesService.findAll(query);
  }

  @Get(':id')
  @Roles('Admin', 'Form Teacher', 'Subject Teacher')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClassDto: UpdateClassDto,
  ) {
    return this.classesService.update(id, updateClassDto);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.remove(id);
  }

  @Get(':id/students')
  @Roles('Admin', 'Form Teacher', 'Subject Teacher')
  getStudents(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: string,
    @Query('per_page') perPage?: string,
  ) {
    return this.classesService.getStudents(
      id,
      page ? parseInt(page, 10) : 1,
      perPage ? parseInt(perPage, 10) : 100,
    );
  }

  @Get(':id/subjects')
  @Roles('Admin', 'Form Teacher', 'Subject Teacher')
  getSubjects(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.getSubjects(id);
  }

  @Post(':classId/subjects')
  @Roles('Admin')
  assignSubject(
    @Param('classId', ParseIntPipe) classId: number,
    @Body('subject_id', ParseIntPipe) subjectId: number,
  ) {
    return this.classesService.assignSubject(classId, subjectId);
  }

  @Delete(':classId/subjects/:subjectId')
  @Roles('Admin')
  removeSubject(
    @Param('classId', ParseIntPipe) classId: number,
    @Param('subjectId', ParseIntPipe) subjectId: number,
  ) {
    return this.classesService.removeSubject(classId, subjectId);
  }

  @Get(':id/results')
  @Roles('Admin', 'Form Teacher')
  getResultsSummary(
    @Param('id', ParseIntPipe) id: number,
    @Query('term_id', ParseIntPipe) termId?: number,
    @Query('session_id', ParseIntPipe) sessionId?: number,
  ) {
    return this.classesService.getResultsSummary(id, termId, sessionId);
  }

  @Get(':id/attendance')
  @Roles('Admin', 'Form Teacher')
  getAttendanceSummary(
    @Param('id', ParseIntPipe) id: number,
    @Query('term_id', ParseIntPipe) termId?: number,
    @Query('session_id', ParseIntPipe) sessionId?: number,
  ) {
    return this.classesService.getAttendanceSummary(id, termId, sessionId);
  }
}
