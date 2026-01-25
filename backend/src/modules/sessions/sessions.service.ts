import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicSession } from '../../entities/academic-session.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(AcademicSession)
    private readonly sessionRepository: Repository<AcademicSession>,
  ) {}

  async create(createSessionDto: CreateSessionDto) {
    const existing = await this.sessionRepository.findOne({
      where: { sessionName: createSessionDto.sessionName },
    });

    if (existing) {
      throw new ConflictException('Session already exists');
    }

    // If setting as current, unset other current sessions
    if (createSessionDto.isCurrent) {
      await this.sessionRepository.update({ isCurrent: true }, { isCurrent: false });
    }

    const session = this.sessionRepository.create(createSessionDto);
    const saved = await this.sessionRepository.save(session);

    return {
      success: true,
      data: saved,
      message: 'Academic session created successfully',
    };
  }

  async findAll() {
    const sessions = await this.sessionRepository.find({
      order: { startDate: 'DESC' },
      relations: ['terms'],
    });

    return {
      success: true,
      data: sessions,
    };
  }

  async findOne(id: number) {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['terms'],
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    return {
      success: true,
      data: session,
    };
  }

  async getCurrent() {
    const session = await this.sessionRepository.findOne({
      where: { isCurrent: true },
      relations: ['terms'],
    });

    if (!session) {
      throw new NotFoundException('No current session set');
    }

    return {
      success: true,
      data: session,
    };
  }

  async update(id: number, updateSessionDto: UpdateSessionDto) {
    const session = await this.sessionRepository.findOne({ where: { id } });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    // If setting as current, unset other current sessions
    if (updateSessionDto.isCurrent) {
      await this.sessionRepository.update({ isCurrent: true }, { isCurrent: false });
    }

    Object.assign(session, updateSessionDto);
    const updated = await this.sessionRepository.save(session);

    return {
      success: true,
      data: updated,
      message: 'Session updated successfully',
    };
  }

  async remove(id: number) {
    const session = await this.sessionRepository.findOne({ where: { id } });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    await this.sessionRepository.remove(session);

    return {
      success: true,
      message: 'Session deleted successfully',
    };
  }
}
