import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const existing = await this.roleRepository.findOne({
      where: { roleName: createRoleDto.roleName },
    });

    if (existing) {
      throw new ConflictException('Role already exists');
    }

    const role = this.roleRepository.create(createRoleDto);
    const saved = await this.roleRepository.save(role);

    return {
      success: true,
      data: saved,
      message: 'Role created successfully',
    };
  }

  async findAll() {
    const roles = await this.roleRepository.find({
      order: { roleName: 'ASC' },
    });

    return {
      success: true,
      data: roles,
    };
  }

  async findOne(id: number) {
    const role = await this.roleRepository.findOne({ where: { id } });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return {
      success: true,
      data: role,
    };
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepository.findOne({ where: { id } });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    if (updateRoleDto.roleName) {
      const existing = await this.roleRepository.findOne({
        where: { roleName: updateRoleDto.roleName },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Role name already exists');
      }
    }

    Object.assign(role, updateRoleDto);
    const updated = await this.roleRepository.save(role);

    return {
      success: true,
      data: updated,
      message: 'Role updated successfully',
    };
  }
}
