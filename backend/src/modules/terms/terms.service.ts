import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Term } from '../../entities/term.entity';
import { CreateTermDto } from './dto/create-term.dto';
import { UpdateTermDto } from './dto/update-term.dto';

@Injectable()
export class TermsService {
  constructor(
    @InjectRepository(Term)
    private readonly termRepository: Repository<Term>,
  ) {}

  async create(createTermDto: CreateTermDto) {
    const existing = await this.termRepository.findOne({
      where: {
        termName: createTermDto.termName,
        sessionId: createTermDto.sessionId,
      },
    });

    if (existing) {
      throw new ConflictException('Term already exists for this session');
    }

    // If setting as current, unset other current terms
    if (createTermDto.isCurrent) {
      await this.termRepository.update({ isCurrent: true }, { isCurrent: false });
    }

    const term = this.termRepository.create(createTermDto);
    const saved = await this.termRepository.save(term);

    return {
      success: true,
      data: await this.findOne(saved.id),
      message: 'Term created successfully',
    };
  }

  async findAll() {
    const terms = await this.termRepository.find({
      order: { sessionId: 'DESC', termName: 'ASC' },
      relations: ['session'],
    });

    return {
      success: true,
      data: terms,
    };
  }

  async findOne(id: number) {
    const term = await this.termRepository.findOne({
      where: { id },
      relations: ['session'],
    });

    if (!term) {
      throw new NotFoundException(`Term with ID ${id} not found`);
    }

    return {
      success: true,
      data: term,
    };
  }

  async getCurrent() {
    const term = await this.termRepository.findOne({
      where: { isCurrent: true },
      relations: ['session'],
    });

    if (!term) {
      throw new NotFoundException('No current term set');
    }

    return {
      success: true,
      data: term,
    };
  }

  async update(id: number, updateTermDto: UpdateTermDto) {
    const term = await this.termRepository.findOne({ where: { id } });

    if (!term) {
      throw new NotFoundException(`Term with ID ${id} not found`);
    }

    // If setting as current, unset other current terms
    if (updateTermDto.isCurrent) {
      await this.termRepository.update({ isCurrent: true }, { isCurrent: false });
    }

    Object.assign(term, updateTermDto);
    const updated = await this.termRepository.save(term);

    return {
      success: true,
      data: await this.findOne(updated.id),
      message: 'Term updated successfully',
    };
  }

  async remove(id: number) {
    const term = await this.termRepository.findOne({ where: { id } });

    if (!term) {
      throw new NotFoundException(`Term with ID ${id} not found`);
    }

    await this.termRepository.remove(term);

    return {
      success: true,
      message: 'Term deleted successfully',
    };
  }
}
