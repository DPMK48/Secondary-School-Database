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
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles('Admin', 'Form Teacher', 'Subject Teacher')
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Post('bulk')
  @Roles('Admin', 'Form Teacher')
  bulkCreate(@Body() bulkAttendanceDto: BulkAttendanceDto) {
    return this.attendanceService.bulkCreate(bulkAttendanceDto);
  }

  @Get()
  @Roles('Admin', 'Form Teacher', 'Subject Teacher')
  findAll(@Query() query: QueryAttendanceDto) {
    return this.attendanceService.findAll(query);
  }

  @Get('statistics')
  @Roles('Admin', 'Form Teacher')
  getStatistics(
    @Query('sessionId', ParseIntPipe) sessionId?: number,
    @Query('termId', ParseIntPipe) termId?: number,
  ) {
    return this.attendanceService.getStatistics(sessionId, termId);
  }

  @Get('class/:classId/date/:date')
  @Roles('Admin', 'Form Teacher', 'Subject Teacher')
  getClassByDate(
    @Param('classId', ParseIntPipe) classId: number,
    @Param('date') date: string,
  ) {
    return this.attendanceService.getClassByDate(classId, date);
  }

  @Get('student/:studentId/summary')
  @Roles('Admin', 'Form Teacher', 'Subject Teacher')
  getStudentSummary(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('termId', ParseIntPipe) termId?: number,
    @Query('sessionId', ParseIntPipe) sessionId?: number,
  ) {
    return this.attendanceService.getStudentSummary(studentId, termId, sessionId);
  }

  @Get('class/:classId/summary')
  @Roles('Admin', 'Form Teacher')
  getClassSummary(
    @Param('classId', ParseIntPipe) classId: number,
    @Query('termId', ParseIntPipe) termId?: number,
    @Query('sessionId', ParseIntPipe) sessionId?: number,
  ) {
    return this.attendanceService.getClassSummary(classId, termId, sessionId);
  }

  @Get(':id')
  @Roles('Admin', 'Form Teacher', 'Subject Teacher')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin', 'Form Teacher')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(id, updateAttendanceDto);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.remove(id);
  }
}
