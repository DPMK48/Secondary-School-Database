import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Teacher } from '../../entities/teacher.entity';
import { TeacherSubjectClass } from '../../entities/teacher-subject-class.entity';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { QueryTeacherDto } from './dto/query-teacher.dto';
import { AssignSubjectClassDto } from './dto/assign-subject-class.dto';
import { generateStaffId, generateUsername, generatePassword } from '../../utils/generators.util';
import { ROLES } from '../../utils/constants';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(TeacherSubjectClass)
    private readonly assignmentRepository: Repository<TeacherSubjectClass>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createTeacherDto: CreateTeacherDto) {
    // Generate staff ID if not provided
    if (!createTeacherDto.staffId) {
      createTeacherDto.staffId = await this.generateUniqueStaffId();
    }

    // Check for duplicates
    const existingEmail = await this.teacherRepository.findOne({
      where: { email: createTeacherDto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const existingPhone = await this.teacherRepository.findOne({
      where: { phone: createTeacherDto.phone },
    });
    if (existingPhone) {
      throw new ConflictException('Phone number already exists');
    }

    // Get the Subject Teacher role
    const subjectTeacherRole = await this.roleRepository.findOne({
      where: { roleName: ROLES.SUBJECT_TEACHER },
    });

    if (!subjectTeacherRole) {
      throw new NotFoundException('Subject Teacher role not found. Please run database seeding.');
    }

    // Generate unique username
    let username = generateUsername(createTeacherDto.firstName, createTeacherDto.lastName);
    let usernameExists = await this.userRepository.findOne({ where: { username } });
    let counter = 1;
    
    while (usernameExists) {
      username = generateUsername(createTeacherDto.firstName, createTeacherDto.lastName) + counter;
      usernameExists = await this.userRepository.findOne({ where: { username } });
      counter++;
    }

    // Generate password
    const generatedPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Create user account
    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      roleId: subjectTeacherRole.id,
      isActive: true,
      mustChangePassword: true,
    });

    const savedUser = await this.userRepository.save(user);

    // Create teacher with user reference
    const teacher = this.teacherRepository.create({
      ...createTeacherDto,
      userId: savedUser.id,
    });
    
    const saved = await this.teacherRepository.save(teacher);

    // Fetch the complete teacher data with relations
    const teacherData = await this.teacherRepository.findOne({
      where: { id: saved.id },
      relations: ['user', 'user.role'],
    });

    return {
      success: true,
      data: teacherData,
      credentials: {
        username,
        password: generatedPassword,
      },
      message: 'Teacher created successfully',
    };
  }

  async findAll(query: QueryTeacherDto) {
    const { status, search, page, perPage } = query;
    const queryBuilder = this.teacherRepository
      .createQueryBuilder('teacher')
      .leftJoinAndSelect('teacher.user', 'user')
      .leftJoinAndSelect('user.role', 'role');

    if (status) {
      queryBuilder.andWhere('teacher.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(teacher.firstName ILIKE :search OR teacher.lastName ILIKE :search OR teacher.email ILIKE :search OR teacher.staffId ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * perPage)
      .take(perPage)
      .orderBy('teacher.firstName', 'ASC')
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
    const teacher = await this.teacherRepository.findOne({
      where: { id },
      relations: ['user', 'user.role'],
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    return {
      success: true,
      data: teacher,
    };
  }

  async update(id: number, updateTeacherDto: UpdateTeacherDto) {
    const teacher = await this.teacherRepository.findOne({ where: { id } });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    // Check email uniqueness if updating
    if (updateTeacherDto.email) {
      const existing = await this.teacherRepository.findOne({
        where: { email: updateTeacherDto.email },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    Object.assign(teacher, updateTeacherDto);
    const updated = await this.teacherRepository.save(teacher);

    return {
      success: true,
      data: await this.findOne(updated.id),
      message: 'Teacher updated successfully',
    };
  }

  async remove(id: number) {
    const teacher = await this.teacherRepository.findOne({ where: { id } });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    await this.teacherRepository.remove(teacher);

    return {
      success: true,
      message: 'Teacher deleted successfully',
    };
  }

  async getSubjects(id: number) {
    const teacher = await this.teacherRepository.findOne({
      where: { id },
      relations: ['assignments', 'assignments.subject', 'assignments.class'],
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    return {
      success: true,
      data: teacher.assignments,
    };
  }

  async getClasses(id: number) {
    const teacher = await this.teacherRepository.findOne({
      where: { id },
      relations: ['assignments', 'assignments.class', 'assignments.subject'],
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    return {
      success: true,
      data: teacher.assignments,
    };
  }

  async assignSubjectClass(assignDto: AssignSubjectClassDto) {
    // Check if assignment already exists
    const existing = await this.assignmentRepository.findOne({
      where: {
        teacherId: assignDto.teacherId,
        subjectId: assignDto.subjectId,
        classId: assignDto.classId,
      },
    });

    if (existing) {
      throw new ConflictException('This assignment already exists');
    }

    const assignment = this.assignmentRepository.create(assignDto);
    const saved = await this.assignmentRepository.save(assignment);

    const result = await this.assignmentRepository.findOne({
      where: { id: saved.id },
      relations: ['teacher', 'subject', 'class'],
    });

    return {
      success: true,
      data: result,
      message: 'Teacher assigned successfully',
    };
  }

  async removeAssignment(assignmentId: number) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
    }

    await this.assignmentRepository.remove(assignment);

    return {
      success: true,
      message: 'Assignment removed successfully',
    };
  }

  async getBySubject(subjectId: number) {
    const assignments = await this.assignmentRepository.find({
      where: { subjectId },
      relations: ['teacher', 'class'],
    });

    const teachers = assignments.map((a) => ({
      ...a.teacher,
      assignedClass: a.class,
    }));

    return {
      success: true,
      data: teachers,
    };
  }

  async getByClass(classId: number) {
    const assignments = await this.assignmentRepository.find({
      where: { classId },
      relations: ['teacher', 'subject'],
    });

    const teachers = assignments.map((a) => ({
      ...a.teacher,
      assignedSubject: a.subject,
    }));

    return {
      success: true,
      data: teachers,
    };
  }

  private async generateUniqueStaffId(): Promise<string> {
    let staffId: string;
    let exists = true;

    while (exists) {
      staffId = generateStaffId();
      const existing = await this.teacherRepository.findOne({
        where: { staffId },
      });
      exists = !!existing;
    }

    return staffId;
  }
}
