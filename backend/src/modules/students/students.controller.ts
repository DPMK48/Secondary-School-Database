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
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentDto } from './dto/query-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles('Admin')
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @Roles('Admin', 'Form Teacher', 'Subject Teacher')
  findAll(@Query() query: QueryStudentDto) {
    return this.studentsService.findAll(query);
  }

  @Get(':id')
  @Roles('Admin', 'Form Teacher', 'Subject Teacher')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.remove(id);
  }

  @Get(':id/results')
  @Roles('Admin', 'Form Teacher', 'Subject Teacher')
  getResults(
    @Param('id', ParseIntPipe) id: number,
    @Query('term_id', ParseIntPipe) termId?: number,
    @Query('session_id', ParseIntPipe) sessionId?: number,
  ) {
    return this.studentsService.getResults(id, termId, sessionId);
  }

  @Get(':id/attendance')
  @Roles('Admin', 'Form Teacher')
  getAttendance(
    @Param('id', ParseIntPipe) id: number,
    @Query('term_id', ParseIntPipe) termId?: number,
    @Query('session_id', ParseIntPipe) sessionId?: number,
  ) {
    return this.studentsService.getAttendance(id, termId, sessionId);
  }
}
