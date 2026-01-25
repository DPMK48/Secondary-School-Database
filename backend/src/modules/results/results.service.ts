import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Result } from '../../entities/result.entity';
import { Assessment } from '../../entities/assessment.entity';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { BulkResultDto } from './dto/bulk-result.dto';
import { QueryResultDto } from './dto/query-result.dto';
import { paginate } from '../../common/helpers/pagination.helper';
import { 
  getGrade, 
  calculateAverage, 
  calculateTotal, 
  calculatePositions,
  GRADING_SYSTEM_AF,
  GRADING_SYSTEM_PERCENTAGE 
} from '../../utils/grading.util';

@Injectable()
export class ResultsService {
  constructor(
    @InjectRepository(Result)
    private readonly resultRepository: Repository<Result>,
    @InjectRepository(Assessment)
    private readonly assessmentRepository: Repository<Assessment>,
  ) {}

  async create(createResultDto: CreateResultDto) {
    // Check if result already exists
    const existing = await this.resultRepository.findOne({
      where: {
        studentId: createResultDto.studentId,
        subjectId: createResultDto.subjectId,
        assessmentId: createResultDto.assessmentId,
        termId: createResultDto.termId,
      },
    });

    if (existing) {
      // Check if locked
      if (existing.isLocked) {
        throw new ForbiddenException('Results are locked and cannot be modified');
      }
      // Update instead
      existing.score = createResultDto.score;
      const updated = await this.resultRepository.save(existing);
      return {
        success: true,
        data: updated,
        message: 'Result updated successfully',
      };
    }

    const result = this.resultRepository.create(createResultDto);
    const saved = await this.resultRepository.save(result);

    return {
      success: true,
      data: saved,
      message: 'Result recorded successfully',
    };
  }

  async bulkCreate(bulkResultDto: BulkResultDto) {
    const { subjectId, classId, teacherId, sessionId, termId, assessmentId, scores } = bulkResultDto;

    // Check if results are locked
    const locked = await this.resultRepository.findOne({
      where: {
        classId,
        subjectId,
        termId,
        isLocked: true,
      },
    });

    if (locked) {
      throw new ForbiddenException('Results are locked and cannot be modified');
    }

    const records = [];
    for (const scoreEntry of scores) {
      // Check if exists
      const existing = await this.resultRepository.findOne({
        where: {
          studentId: scoreEntry.studentId,
          subjectId,
          assessmentId,
          termId,
        },
      });

      if (existing) {
        existing.score = scoreEntry.score;
        records.push(existing);
      } else {
        const result = this.resultRepository.create({
          studentId: scoreEntry.studentId,
          subjectId,
          classId,
          teacherId,
          sessionId,
          termId,
          assessmentId,
          score: scoreEntry.score,
        });
        records.push(result);
      }
    }

    const saved = await this.resultRepository.save(records);

    return {
      success: true,
      data: saved,
      message: 'Bulk results recorded successfully',
    };
  }

  async findAll(query: QueryResultDto) {
    const {
      studentId,
      subjectId,
      classId,
      teacherId,
      sessionId,
      termId,
      assessmentId,
      isApproved,
      isLocked,
      search,
      page = 1,
      perPage = 20,
    } = query;

    const queryBuilder = this.resultRepository
      .createQueryBuilder('result')
      .leftJoinAndSelect('result.student', 'student')
      .leftJoinAndSelect('result.subject', 'subject')
      .leftJoinAndSelect('result.class', 'class')
      .leftJoinAndSelect('result.teacher', 'teacher')
      .leftJoinAndSelect('result.session', 'session')
      .leftJoinAndSelect('result.term', 'term')
      .leftJoinAndSelect('result.assessment', 'assessment');

    if (studentId) queryBuilder.andWhere('result.studentId = :studentId', { studentId });
    if (subjectId) queryBuilder.andWhere('result.subjectId = :subjectId', { subjectId });
    if (classId) queryBuilder.andWhere('result.classId = :classId', { classId });
    if (teacherId) queryBuilder.andWhere('result.teacherId = :teacherId', { teacherId });
    if (sessionId) queryBuilder.andWhere('result.sessionId = :sessionId', { sessionId });
    if (termId) queryBuilder.andWhere('result.termId = :termId', { termId });
    if (assessmentId) queryBuilder.andWhere('result.assessmentId = :assessmentId', { assessmentId });
    if (typeof isApproved === 'boolean') queryBuilder.andWhere('result.isApproved = :isApproved', { isApproved });
    if (typeof isLocked === 'boolean') queryBuilder.andWhere('result.isLocked = :isLocked', { isLocked });

    if (search) {
      queryBuilder.andWhere(
        '(student.firstName ILIKE :search OR student.lastName ILIKE :search OR student.admissionNo ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('result.createdAt', 'DESC');

    const result = await paginate(queryBuilder, page, perPage);

    return {
      success: true,
      ...result,
    };
  }

  async findOne(id: number) {
    const result = await this.resultRepository.findOne({
      where: { id },
      relations: ['student', 'subject', 'class', 'teacher', 'session', 'term', 'assessment'],
    });

    if (!result) {
      throw new NotFoundException(`Result with ID ${id} not found`);
    }

    return {
      success: true,
      data: result,
    };
  }

  async getStudentResults(studentId: number, termId: number, sessionId: number) {
    const results = await this.resultRepository.find({
      where: { studentId, termId, sessionId },
      relations: ['subject', 'assessment'],
      order: { subject: { subjectName: 'ASC' } },
    });

    // Group by subject
    const subjectResults = {};
    results.forEach((result) => {
      if (!subjectResults[result.subjectId]) {
        subjectResults[result.subjectId] = {
          subject: result.subject,
          scores: [],
          total: 0,
          average: 0,
          grade: '',
        };
      }
      subjectResults[result.subjectId].scores.push({
        assessment: result.assessment.name,
        score: result.score,
        maxScore: result.assessment.maxScore,
      });
    });

    // Calculate totals and grades
    Object.keys(subjectResults).forEach((subjectId) => {
      const scores = subjectResults[subjectId].scores.map((s) => s.score);
      subjectResults[subjectId].total = calculateTotal(scores);
      subjectResults[subjectId].average = calculateAverage(scores);
      subjectResults[subjectId].grade = getGrade(subjectResults[subjectId].average, 'AF').grade;
    });

    return {
      success: true,
      data: Object.values(subjectResults),
    };
  }

  async getClassResults(classId: number, subjectId: number, termId: number, sessionId: number) {
    const results = await this.resultRepository.find({
      where: { classId, subjectId, termId, sessionId },
      relations: ['student', 'assessment'],
      order: { student: { firstName: 'ASC' } },
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
          grade: '',
        };
      }
      studentResults[result.studentId].scores.push({
        assessment: result.assessment.name,
        score: result.score,
        maxScore: result.assessment.maxScore,
      });
    });

    // Calculate totals and grades
    const studentData = Object.values(studentResults).map((data: any) => {
      const scores = data.scores.map((s) => s.score);
      data.total = calculateTotal(scores);
      data.average = calculateAverage(scores);
      data.grade = getGrade(data.average, 'AF').grade;
      return data;
    });

    // Calculate positions
    const withPositions = calculatePositions(studentData);

    return {
      success: true,
      data: withPositions,
    };
  }

  async approveResults(classId: number, subjectId: number, termId: number) {
    await this.resultRepository.update(
      { classId, subjectId, termId },
      { isApproved: true },
    );

    return {
      success: true,
      message: 'Results approved successfully',
    };
  }

  async lockResults(classId: number, termId: number) {
    await this.resultRepository.update(
      { classId, termId },
      { isLocked: true },
    );

    return {
      success: true,
      message: 'Results locked successfully',
    };
  }

  async unlockResults(classId: number, termId: number) {
    await this.resultRepository.update(
      { classId, termId },
      { isLocked: false },
    );

    return {
      success: true,
      message: 'Results unlocked successfully',
    };
  }

  async update(id: number, updateResultDto: UpdateResultDto) {
    const result = await this.resultRepository.findOne({ where: { id } });

    if (!result) {
      throw new NotFoundException(`Result with ID ${id} not found`);
    }

    if (result.isLocked) {
      throw new ForbiddenException('Results are locked and cannot be modified');
    }

    Object.assign(result, updateResultDto);
    const updated = await this.resultRepository.save(result);

    return {
      success: true,
      data: updated,
      message: 'Result updated successfully',
    };
  }

  async remove(id: number) {
    const result = await this.resultRepository.findOne({ where: { id } });

    if (!result) {
      throw new NotFoundException(`Result with ID ${id} not found`);
    }

    if (result.isLocked) {
      throw new ForbiddenException('Results are locked and cannot be deleted');
    }

    await this.resultRepository.remove(result);

    return {
      success: true,
      message: 'Result deleted successfully',
    };
  }

  async getFormTeacherCompilation(classId: number, termId: number, sessionId: number) {
    // Get all students in class
    const results = await this.resultRepository.find({
      where: { classId, termId, sessionId },
      relations: ['student', 'subject', 'assessment'],
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
          position: 0,
        };
      }

      if (!studentResults[result.studentId].subjects[result.subjectId]) {
        studentResults[result.studentId].subjects[result.subjectId] = {
          subject: result.subject,
          scores: [],
          total: 0,
          average: 0,
          grade: '',
        };
      }

      studentResults[result.studentId].subjects[result.subjectId].scores.push(result.score);
    });

    // Calculate totals for each student
    const studentData = Object.values(studentResults).map((data: any) => {
      let totalSubjectAverages = 0;
      let subjectCount = 0;

      Object.keys(data.subjects).forEach((subjectId) => {
        const scores = data.subjects[subjectId].scores;
        data.subjects[subjectId].total = calculateTotal(scores);
        data.subjects[subjectId].average = calculateAverage(scores);
        data.subjects[subjectId].grade = getGrade(data.subjects[subjectId].average, 'AF').grade;
        
        totalSubjectAverages += data.subjects[subjectId].average;
        subjectCount++;
      });

      data.averageScore = subjectCount > 0 ? totalSubjectAverages / subjectCount : 0;
      data.totalScore = totalSubjectAverages;
      data.subjects = Object.values(data.subjects);

      return data;
    });

    // Calculate positions
    const withPositions = calculatePositions(studentData);

    return {
      success: true,
      data: withPositions,
    };
  }

  async getStatistics(sessionId?: number, termId?: number) {
    const where: any = {};
    if (sessionId) where.sessionId = sessionId;
    if (termId) where.termId = termId;

    const results = await this.resultRepository.find({ where });

    const totalResults = results.length;
    const averageScore = results.length > 0 
      ? results.reduce((sum, r) => sum + r.score, 0) / totalResults 
      : 0;

    const gradeDistribution = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
      F: 0,
    };

    results.forEach((result) => {
      const grade = getGrade(result.score, 'AF').grade;
      if (gradeDistribution[grade] !== undefined) {
        gradeDistribution[grade]++;
      }
    });

    return {
      success: true,
      data: {
        totalResults,
        averageScore: parseFloat(averageScore.toFixed(2)),
        gradeDistribution,
      },
    };
  }
}
