import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Result } from '../../entities/result.entity';
import { Attendance, AttendanceStatus } from '../../entities/attendance.entity';
import { Student, StudentStatus } from '../../entities/student.entity';
import { Class } from '../../entities/class.entity';
import { 
  getGrade, 
  calculateAverage, 
  calculateTotal, 
  calculatePositions,
  getPerformanceRemark,
} from '../../utils/grading.util';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Result)
    private readonly resultRepository: Repository<Result>,
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
  ) {}

  async getStudentReport(studentId: number, termId: number, sessionId: number) {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['currentClass'],
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // Get all results
    const results = await this.resultRepository.find({
      where: { studentId, termId, sessionId },
      relations: ['subject', 'assessment'],
    });

    // Get attendance
    const attendance = await this.attendanceRepository.find({
      where: { studentId, termId, sessionId },
    });

    // Group results by subject
    const subjectResults = {};
    results.forEach((result) => {
      if (!subjectResults[result.subjectId]) {
        subjectResults[result.subjectId] = {
          subject: result.subject,
          scores: [],
          total: 0,
          average: 0,
          grade: '',
          remark: '',
        };
      }
      subjectResults[result.subjectId].scores.push(result.score);
    });

    // Calculate totals and grades
    Object.keys(subjectResults).forEach((subjectId) => {
      const scores = subjectResults[subjectId].scores;
      subjectResults[subjectId].total = calculateTotal(scores);
      subjectResults[subjectId].average = calculateAverage(scores);
      const gradeInfo = getGrade(subjectResults[subjectId].average, 'AF');
      subjectResults[subjectId].grade = gradeInfo.grade;
      subjectResults[subjectId].remark = gradeInfo.remark;
    });

    // Calculate overall average
    const allAverages = Object.values(subjectResults).map((s: any) => s.average);
    const overallAverage = calculateAverage(allAverages);

    // Attendance summary
    const attendanceSummary = {
      total: attendance.length,
      present: attendance.filter((a) => a.status === AttendanceStatus.PRESENT).length,
      absent: attendance.filter((a) => a.status === AttendanceStatus.ABSENT).length,
      late: attendance.filter((a) => a.status === AttendanceStatus.LATE).length,
      excused: attendance.filter((a) => a.status === AttendanceStatus.EXCUSED).length,
    };

    return {
      success: true,
      data: {
        student,
        subjects: Object.values(subjectResults),
        overallAverage,
        overallGrade: getGrade(overallAverage, 'AF').grade,
        performanceRemark: getPerformanceRemark(overallAverage),
        attendance: attendanceSummary,
      },
    };
  }

  async getClassReport(classId: number, termId: number, sessionId: number) {
    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
      relations: ['students'],
    });

    if (!classEntity) {
      throw new Error('Class not found');
    }

    // Get all results for the class
    const results = await this.resultRepository.find({
      where: { classId, termId, sessionId },
      relations: ['student', 'subject'],
    });

    // Group by student
    const studentResults = {};
    results.forEach((result) => {
      if (!studentResults[result.studentId]) {
        studentResults[result.studentId] = {
          student: result.student,
          subjects: {},
          totalScore: 0,
          averageScore: 0,
        };
      }

      if (!studentResults[result.studentId].subjects[result.subjectId]) {
        studentResults[result.studentId].subjects[result.subjectId] = {
          subject: result.subject,
          scores: [],
        };
      }

      studentResults[result.studentId].subjects[result.subjectId].scores.push(result.score);
    });

    // Calculate averages
    const studentData = Object.values(studentResults).map((data: any) => {
      let totalSubjectAverages = 0;
      let subjectCount = 0;

      Object.keys(data.subjects).forEach((subjectId) => {
        const scores = data.subjects[subjectId].scores;
        const average = calculateAverage(scores);
        totalSubjectAverages += average;
        subjectCount++;
      });

      data.averageScore = subjectCount > 0 ? totalSubjectAverages / subjectCount : 0;
      data.totalScore = totalSubjectAverages;

      return data;
    });

    // Calculate positions
    const withPositions = calculatePositions(studentData);

    // Calculate class statistics
    const averages = studentData.map((s) => s.averageScore);
    const classAverage = calculateAverage(averages);
    const highestScore = Math.max(...averages);
    const lowestScore = Math.min(...averages);

    return {
      success: true,
      data: {
        class: classEntity,
        students: withPositions,
        statistics: {
          totalStudents: studentData.length,
          classAverage,
          highestScore,
          lowestScore,
        },
      },
    };
  }

  async getSubjectReport(subjectId: number, classId: number, termId: number, sessionId: number) {
    const results = await this.resultRepository.find({
      where: { subjectId, classId, termId, sessionId },
      relations: ['student', 'assessment'],
    });

    // Group by student
    const studentResults = {};
    results.forEach((result) => {
      if (!studentResults[result.studentId]) {
        studentResults[result.studentId] = {
          student: result.student,
          scores: [],
          total: 0,
          average: 0,
        };
      }
      studentResults[result.studentId].scores.push(result.score);
    });

    // Calculate totals
    const studentData = Object.values(studentResults).map((data: any) => {
      data.total = calculateTotal(data.scores);
      data.average = calculateAverage(data.scores);
      data.grade = getGrade(data.average, 'AF').grade;
      return data;
    });

    // Calculate positions
    const withPositions = calculatePositions(studentData);

    // Subject statistics
    const averages = studentData.map((s) => s.average);
    const subjectAverage = calculateAverage(averages);

    return {
      success: true,
      data: {
        students: withPositions,
        statistics: {
          totalStudents: studentData.length,
          subjectAverage,
          highestScore: Math.max(...averages),
          lowestScore: Math.min(...averages),
        },
      },
    };
  }

  async getAttendanceReport(classId?: number, startDate?: string, endDate?: string) {
    const where: any = {};
    if (classId) where.classId = classId;
    if (startDate && endDate) {
      where.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const attendance = await this.attendanceRepository.find({
      where,
      relations: ['student', 'class'],
    });

    const summary = {
      total: attendance.length,
      present: attendance.filter((a) => a.status === AttendanceStatus.PRESENT).length,
      absent: attendance.filter((a) => a.status === AttendanceStatus.ABSENT).length,
      late: attendance.filter((a) => a.status === AttendanceStatus.LATE).length,
      excused: attendance.filter((a) => a.status === AttendanceStatus.EXCUSED).length,
    };

    const attendanceRate = summary.total > 0 
      ? ((summary.present + summary.late) / summary.total) * 100 
      : 0;

    return {
      success: true,
      data: {
        summary,
        attendanceRate: parseFloat(attendanceRate.toFixed(2)),
        records: attendance,
      },
    };
  }

  async getDashboardStats(sessionId?: number, termId?: number) {
    const where: any = {};
    if (sessionId) where.sessionId = sessionId;
    if (termId) where.termId = termId;

    const [totalStudents, totalResults, totalAttendance] = await Promise.all([
      this.studentRepository.count({ where: { status: StudentStatus.ACTIVE } }),
      this.resultRepository.count({ where }),
      this.attendanceRepository.count({ where }),
    ]);

    const results = await this.resultRepository.find({ where });
    const attendance = await this.attendanceRepository.find({ where });

    const averageScore = results.length > 0
      ? results.reduce((sum, r) => sum + r.score, 0) / results.length
      : 0;

    const attendanceRate = attendance.length > 0
      ? (attendance.filter((a) => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE).length / attendance.length) * 100
      : 0;

    return {
      success: true,
      data: {
        totalStudents,
        totalResults,
        totalAttendance,
        averageScore: parseFloat(averageScore.toFixed(2)),
        attendanceRate: parseFloat(attendanceRate.toFixed(2)),
      },
    };
  }

  async exportStudentReportPDF(studentId: number, termId: number, sessionId: number) {
    // This would use puppeteer or pdfkit to generate PDF
    // For now, return the data that would be used
    const reportData = await this.getStudentReport(studentId, termId, sessionId);
    
    return {
      success: true,
      message: 'PDF generation not yet implemented',
      data: reportData.data,
    };
  }

  async exportClassReportPDF(classId: number, termId: number, sessionId: number) {
    // This would use puppeteer or pdfkit to generate PDF
    const reportData = await this.getClassReport(classId, termId, sessionId);
    
    return {
      success: true,
      message: 'PDF generation not yet implemented',
      data: reportData.data,
    };
  }
}
