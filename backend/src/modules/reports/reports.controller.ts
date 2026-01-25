import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('student/:studentId')
  @Roles('Admin', 'Form Teacher', 'Subject Teacher')
  getStudentReport(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('termId', ParseIntPipe) termId: number,
    @Query('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return this.reportsService.getStudentReport(studentId, termId, sessionId);
  }

  @Get('student/:studentId/pdf')
  @Roles('Admin', 'Form Teacher')
  exportStudentReportPDF(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('termId', ParseIntPipe) termId: number,
    @Query('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return this.reportsService.exportStudentReportPDF(studentId, termId, sessionId);
  }

  @Get('class/:classId')
  @Roles('Admin', 'Form Teacher')
  getClassReport(
    @Param('classId', ParseIntPipe) classId: number,
    @Query('termId', ParseIntPipe) termId: number,
    @Query('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return this.reportsService.getClassReport(classId, termId, sessionId);
  }

  @Get('class/:classId/pdf')
  @Roles('Admin', 'Form Teacher')
  exportClassReportPDF(
    @Param('classId', ParseIntPipe) classId: number,
    @Query('termId', ParseIntPipe) termId: number,
    @Query('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return this.reportsService.exportClassReportPDF(classId, termId, sessionId);
  }

  @Get('subject/:subjectId/class/:classId')
  @Roles('Admin', 'Form Teacher', 'Subject Teacher')
  getSubjectReport(
    @Param('subjectId', ParseIntPipe) subjectId: number,
    @Param('classId', ParseIntPipe) classId: number,
    @Query('termId', ParseIntPipe) termId: number,
    @Query('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return this.reportsService.getSubjectReport(subjectId, classId, termId, sessionId);
  }

  @Get('attendance')
  @Roles('Admin', 'Form Teacher')
  getAttendanceReport(
    @Query('classId', ParseIntPipe) classId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getAttendanceReport(classId, startDate, endDate);
  }

  @Get('dashboard')
  @Roles('Admin')
  getDashboardStats(
    @Query('sessionId', ParseIntPipe) sessionId?: number,
    @Query('termId', ParseIntPipe) termId?: number,
  ) {
    return this.reportsService.getDashboardStats(sessionId, termId);
  }
}
