import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assessment } from '../../entities/assessment.entity';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';

@Injectable()
export class AssessmentsService {
  constructor(
    @InjectRepository(Assessment)
    private readonly assessmentRepository: Repository<Assessment>,
  ) {}

  async create(createAssessmentDto: CreateAssessmentDto) {
    const existing = await this.assessmentRepository.findOne({
      where: { name: createAssessmentDto.name },
    });

    if (existing) {
      throw new ConflictException('Assessment with this name already exists');
    }

    const assessment = this.assessmentRepository.create(createAssessmentDto);
    const saved = await this.assessmentRepository.save(assessment);

    return {
      success: true,
      data: saved,
      message: 'Assessment created successfully',
    };
  }

  async findAll() {
    const assessments = await this.assessmentRepository.find({
      order: { name: 'ASC' },
    });

    return {
      success: true,
      data: assessments,
    };
  }

  async findOne(id: number) {
    const assessment = await this.assessmentRepository.findOne({
      where: { id },
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${id} not found`);
    }

    return {
      success: true,
      data: assessment,
    };
  }

  async update(id: number, updateAssessmentDto: UpdateAssessmentDto) {
    const assessment = await this.assessmentRepository.findOne({ where: { id } });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${id} not found`);
    }

    // Check name uniqueness if updating name
    if (updateAssessmentDto.name && updateAssessmentDto.name !== assessment.name) {
      const existing = await this.assessmentRepository.findOne({
        where: { name: updateAssessmentDto.name },
      });

      if (existing) {
        throw new ConflictException('Assessment with this name already exists');
      }
    }

    Object.assign(assessment, updateAssessmentDto);
    const updated = await this.assessmentRepository.save(assessment);

    return {
      success: true,
      data: updated,
      message: 'Assessment updated successfully',
    };
  }

  async remove(id: number) {
    const assessment = await this.assessmentRepository.findOne({ where: { id } });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${id} not found`);
    }

    await this.assessmentRepository.remove(assessment);

    return {
      success: true,
      message: 'Assessment deleted successfully',
    };
  }
}
