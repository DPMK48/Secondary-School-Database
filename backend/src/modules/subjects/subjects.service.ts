import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from '../../entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { QuerySubjectDto } from './dto/query-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}

  async create(createSubjectDto: CreateSubjectDto) {
    const existing = await this.subjectRepository.findOne({
      where: { subjectCode: createSubjectDto.subjectCode },
    });

    if (existing) {
      throw new ConflictException('Subject code already exists');
    }

    const subject = this.subjectRepository.create(createSubjectDto);
    const saved = await this.subjectRepository.save(subject);

    return {
      success: true,
      data: saved,
      message: 'Subject created successfully',
    };
  }

  async findAll(query: QuerySubjectDto) {
    const { level, search, page, perPage } = query;
    const queryBuilder = this.subjectRepository.createQueryBuilder('subject');

    if (level) {
      queryBuilder.andWhere('subject.level = :level', { level });
    }

    if (search) {
      queryBuilder.andWhere(
        '(subject.subjectName ILIKE :search OR subject.subjectCode ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * perPage)
      .take(perPage)
      .orderBy('subject.subjectName', 'ASC')
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
    const subject = await this.subjectRepository.findOne({
      where: { id },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    return {
      success: true,
      data: subject,
    };
  }

  async update(id: number, updateSubjectDto: UpdateSubjectDto) {
    const subject = await this.subjectRepository.findOne({ where: { id } });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    if (updateSubjectDto.subjectCode) {
      const existing = await this.subjectRepository.findOne({
        where: { subjectCode: updateSubjectDto.subjectCode },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Subject code already exists');
      }
    }

    Object.assign(subject, updateSubjectDto);
    const updated = await this.subjectRepository.save(subject);

    return {
      success: true,
      data: updated,
      message: 'Subject updated successfully',
    };
  }

  async remove(id: number) {
    const subject = await this.subjectRepository.findOne({ where: { id } });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    await this.subjectRepository.remove(subject);

    return {
      success: true,
      message: 'Subject deleted successfully',
    };
  }

  async getTeachers(id: number) {
    const subject = await this.subjectRepository.findOne({
      where: { id },
      relations: ['teacherAssignments', 'teacherAssignments.teacher', 'teacherAssignments.class'],
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    return {
      success: true,
      data: subject.teacherAssignments,
    };
  }

  async getClasses(id: number) {
    const subject = await this.subjectRepository.findOne({
      where: { id },
      relations: ['classSubjects', 'classSubjects.class'],
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    return {
      success: true,
      data: subject.classSubjects,
    };
  }
}
