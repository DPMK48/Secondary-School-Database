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
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { QueryTeacherDto } from './dto/query-teacher.dto';
import { AssignSubjectClassDto } from './dto/assign-subject-class.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @Roles('Admin')
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teachersService.create(createTeacherDto);
  }

  @Get()
  @Roles('Admin')
  findAll(@Query() query: QueryTeacherDto) {
    return this.teachersService.findAll(query);
  }

  @Get(':id')
  @Roles('Admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teachersService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ) {
    return this.teachersService.update(id, updateTeacherDto);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teachersService.remove(id);
  }

  @Get(':id/subjects')
  @Roles('Admin', 'Form Teacher', 'Subject Teacher')
  getSubjects(@Param('id', ParseIntPipe) id: number) {
    return this.teachersService.getSubjects(id);
  }

  @Get(':id/classes')
  @Roles('Admin', 'Form Teacher', 'Subject Teacher')
  getClasses(@Param('id', ParseIntPipe) id: number) {
    return this.teachersService.getClasses(id);
  }

  @Post('assign')
  @Roles('Admin')
  assignSubjectClass(@Body() assignDto: AssignSubjectClassDto) {
    return this.teachersService.assignSubjectClass(assignDto);
  }

  @Delete('assign/:assignmentId')
  @Roles('Admin')
  removeAssignment(@Param('assignmentId', ParseIntPipe) assignmentId: number) {
    return this.teachersService.removeAssignment(assignmentId);
  }

  @Get('subject/:subjectId')
  @Roles('Admin')
  getBySubject(@Param('subjectId', ParseIntPipe) subjectId: number) {
    return this.teachersService.getBySubject(subjectId);
  }

  @Get('class/:classId')
  @Roles('Admin', 'Form Teacher')
  getByClass(@Param('classId', ParseIntPipe) classId: number) {
    return this.teachersService.getByClass(classId);
  }
}
