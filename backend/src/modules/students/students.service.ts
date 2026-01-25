import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Student } from '../../entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentDto } from './dto/query-student.dto';
import { generateAdmissionNo } from '../../utils/generators.util';
import { paginate } from '../../common/helpers/pagination.helper';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async create(createStudentDto: CreateStudentDto) {
    // Generate admission number if not provided
    if (!createStudentDto.admissionNo) {
      createStudentDto.admissionNo = await this.generateUniqueAdmissionNo();
    } else {
      // Check if admission number already exists
      const existing = await this.studentRepository.findOne({
        where: { admissionNo: createStudentDto.admissionNo },
      });
      if (existing) {
        throw new ConflictException('Admission number already exists');
      }
    }

    const student = this.studentRepository.create(createStudentDto);
    const saved = await this.studentRepository.save(student);

    return {
      success: true,
      data: await this.findOne(saved.id),
      message: 'Student created successfully',
    };
  }

  async findAll(query: QueryStudentDto) {
    const { classId, status, search, page, perPage } = query;
    const queryBuilder = this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.currentClass', 'currentClass');

    if (classId) {
      queryBuilder.andWhere('student.currentClassId = :classId', { classId });
    }

    if (status) {
      queryBuilder.andWhere('student.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(student.firstName ILIKE :search OR student.lastName ILIKE :search OR student.admissionNo ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * perPage)
      .take(perPage)
      .orderBy('student.firstName', 'ASC')
      .getManyAndCount();

    return {
      success: true,
      data,
      meta: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async findOne(id: number) {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['currentClass'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return {
      success: true,
      data: student,
    };
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    const student = await this.studentRepository.findOne({ where: { id } });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    Object.assign(student, updateStudentDto);
    const updated = await this.studentRepository.save(student);

    return {
      success: true,
      data: await this.findOne(updated.id),
      message: 'Student updated successfully',
    };
  }

  async remove(id: number) {
    const student = await this.studentRepository.findOne({ where: { id } });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    await this.studentRepository.remove(student);

    return {
      success: true,
      message: 'Student deleted successfully',
    };
  }

  async getResults(id: number, termId?: number, sessionId?: number) {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['results', 'results.subject', 'results.assessment'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    let results = student.results;

    if (termId) {
      results = results.filter((r) => r.termId === termId);
    }

    if (sessionId) {
      results = results.filter((r) => r.sessionId === sessionId);
    }

    return {
      success: true,
      data: results,
    };
  }

  async getAttendance(id: number, termId?: number, sessionId?: number) {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['attendance'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    let attendance = student.attendance;

    if (termId) {
      attendance = attendance.filter((a) => a.termId === termId);
    }

    if (sessionId) {
      attendance = attendance.filter((a) => a.sessionId === sessionId);
    }

    // Calculate summary
    const summary = {
      total: attendance.length,
      present: attendance.filter((a) => a.status === 'Present').length,
      absent: attendance.filter((a) => a.status === 'Absent').length,
      late: attendance.filter((a) => a.status === 'Late').length,
      excused: attendance.filter((a) => a.status === 'Excused').length,
    };

    return {
      success: true,
      data: {
        attendance,
        summary,
      },
    };
  }

  private async generateUniqueAdmissionNo(): Promise<string> {
    let admissionNo: string;
    let exists = true;

    while (exists) {
      admissionNo = generateAdmissionNo();
      const existing = await this.studentRepository.findOne({
        where: { admissionNo },
      });
      exists = !!existing;
    }

    return admissionNo;
  }
}
