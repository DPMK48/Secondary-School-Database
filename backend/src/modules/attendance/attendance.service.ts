import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Attendance, AttendanceStatus } from '../../entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { paginate } from '../../common/helpers/pagination.helper';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    const existing = await this.attendanceRepository.findOne({
      where: {
        studentId: createAttendanceDto.studentId,
        date: new Date(createAttendanceDto.date),
      },
    });

    if (existing) {
      throw new ConflictException('Attendance already recorded for this date');
    }

    const attendance = this.attendanceRepository.create(createAttendanceDto);
    const saved = await this.attendanceRepository.save(attendance);

    return {
      success: true,
      data: saved,
      message: 'Attendance recorded successfully',
    };
  }

  async bulkCreate(bulkAttendanceDto: BulkAttendanceDto) {
    const { classId, date, sessionId, termId, attendances } = bulkAttendanceDto;

    const records = attendances.map((att) => ({
      studentId: att.studentId,
      classId,
      date,
      sessionId,
      termId,
      status: att.status,
    }));

    // Delete existing attendance for this class and date
    await this.attendanceRepository.delete({
      classId,
      date: new Date(date),
    });

    const saved = await this.attendanceRepository.save(records);

    return {
      success: true,
      data: saved,
      message: 'Bulk attendance recorded successfully',
    };
  }

  async findAll(query: QueryAttendanceDto) {
    const {
      studentId,
      classId,
      sessionId,
      termId,
      status,
      startDate,
      endDate,
      search,
      page = 1,
      perPage = 20,
    } = query;

    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.student', 'student')
      .leftJoinAndSelect('attendance.class', 'class')
      .leftJoinAndSelect('attendance.session', 'session')
      .leftJoinAndSelect('attendance.term', 'term');

    if (studentId) {
      queryBuilder.andWhere('attendance.studentId = :studentId', { studentId });
    }

    if (classId) {
      queryBuilder.andWhere('attendance.classId = :classId', { classId });
    }

    if (sessionId) {
      queryBuilder.andWhere('attendance.sessionId = :sessionId', { sessionId });
    }

    if (termId) {
      queryBuilder.andWhere('attendance.termId = :termId', { termId });
    }

    if (status) {
      queryBuilder.andWhere('attendance.status = :status', { status });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('attendance.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(student.firstName ILIKE :search OR student.lastName ILIKE :search OR student.admissionNo ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('attendance.date', 'DESC');

    const result = await paginate(queryBuilder, page, perPage);

    return {
      success: true,
      ...result,
    };
  }

  async findOne(id: number) {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: ['student', 'class', 'session', 'term'],
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    return {
      success: true,
      data: attendance,
    };
  }

  async getClassByDate(classId: number, date: string) {
    const records = await this.attendanceRepository.find({
      where: {
        classId,
        date: new Date(date),
      },
      relations: ['student'],
      order: { student: { firstName: 'ASC' } },
    });

    return {
      success: true,
      data: records,
    };
  }

  async getStudentSummary(studentId: number, termId?: number, sessionId?: number) {
    const where: any = { studentId };
    if (termId) where.termId = termId;
    if (sessionId) where.sessionId = sessionId;

    const records = await this.attendanceRepository.find({ where });

    const summary = {
      total: records.length,
      present: records.filter((r) => r.status === AttendanceStatus.PRESENT).length,
      absent: records.filter((r) => r.status === AttendanceStatus.ABSENT).length,
      late: records.filter((r) => r.status === AttendanceStatus.LATE).length,
      excused: records.filter((r) => r.status === AttendanceStatus.EXCUSED).length,
    };

    return {
      success: true,
      data: {
        summary,
        records,
      },
    };
  }

  async getClassSummary(classId: number, termId?: number, sessionId?: number) {
    const where: any = { classId };
    if (termId) where.termId = termId;
    if (sessionId) where.sessionId = sessionId;

    const records = await this.attendanceRepository.find({ where });

    const summary = {
      total: records.length,
      present: records.filter((r) => r.status === AttendanceStatus.PRESENT).length,
      absent: records.filter((r) => r.status === AttendanceStatus.ABSENT).length,
      late: records.filter((r) => r.status === AttendanceStatus.LATE).length,
      excused: records.filter((r) => r.status === AttendanceStatus.EXCUSED).length,
    };

    return {
      success: true,
      data: summary,
    };
  }

  async update(id: number, updateAttendanceDto: UpdateAttendanceDto) {
    const attendance = await this.attendanceRepository.findOne({ where: { id } });

    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    Object.assign(attendance, updateAttendanceDto);
    const updated = await this.attendanceRepository.save(attendance);

    return {
      success: true,
      data: updated,
      message: 'Attendance updated successfully',
    };
  }

  async remove(id: number) {
    const attendance = await this.attendanceRepository.findOne({ where: { id } });

    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    await this.attendanceRepository.remove(attendance);

    return {
      success: true,
      message: 'Attendance deleted successfully',
    };
  }

  async getStatistics(sessionId?: number, termId?: number) {
    const where: any = {};
    if (sessionId) where.sessionId = sessionId;
    if (termId) where.termId = termId;

    const records = await this.attendanceRepository.find({ where });

    const stats = {
      totalRecords: records.length,
      present: records.filter((r) => r.status === AttendanceStatus.PRESENT).length,
      absent: records.filter((r) => r.status === AttendanceStatus.ABSENT).length,
      late: records.filter((r) => r.status === AttendanceStatus.LATE).length,
      excused: records.filter((r) => r.status === AttendanceStatus.EXCUSED).length,
      attendanceRate: 0,
    };

    if (stats.totalRecords > 0) {
      stats.attendanceRate = ((stats.present + stats.late) / stats.totalRecords) * 100;
    }

    return {
      success: true,
      data: stats,
    };
  }
}
