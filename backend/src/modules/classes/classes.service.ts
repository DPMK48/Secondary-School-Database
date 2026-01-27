import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Class } from '../../entities/class.entity';
import { ClassSubject } from '../../entities/class-subject.entity';
import { Student } from '../../entities/student.entity';
import { FormTeacher } from '../../entities/form-teacher.entity';
import { Teacher } from '../../entities/teacher.entity';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { AcademicSession } from '../../entities/academic-session.entity';
import { TeacherSubjectClass } from '../../entities/teacher-subject-class.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { QueryClassDto } from './dto/query-class.dto';
import { generateUsername, generatePassword } from '../../utils/generators.util';
import { ROLES } from '../../utils/constants';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(ClassSubject)
    private readonly classSubjectRepository: Repository<ClassSubject>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(FormTeacher)
    private readonly formTeacherRepository: Repository<FormTeacher>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(AcademicSession)
    private readonly sessionRepository: Repository<AcademicSession>,
    @InjectRepository(TeacherSubjectClass)
    private readonly teacherSubjectClassRepository: Repository<TeacherSubjectClass>,
  ) {}

  async create(createClassDto: CreateClassDto) {
    // Check if class with same name and arm exists
    const existing = await this.classRepository.findOne({
      where: {
        className: createClassDto.className,
        arm: createClassDto.arm,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Class ${createClassDto.className} ${createClassDto.arm} already exists`,
      );
    }

    const { formTeacherId, ...classData } = createClassDto;
    const classEntity = this.classRepository.create(classData);
    const saved = await this.classRepository.save(classEntity);

    let credentials = null;

    // Handle form teacher assignment
    if (formTeacherId) {
      const result = await this.assignFormTeacher(saved.id, formTeacherId);
      credentials = result.credentials;
    }

    return {
      success: true,
      data: saved,
      credentials,
      message: 'Class created successfully',
    };
  }

  async findAll(query: QueryClassDto) {
    const { level, search, page, perPage } = query;

    // Get current session
    const currentSession = await this.sessionRepository.findOne({
      where: { isCurrent: true },
    });

    const queryBuilder = this.classRepository.createQueryBuilder('class')
      .leftJoinAndSelect('class.students', 'students');

    // Join form teachers filtered by current session
    if (currentSession) {
      queryBuilder
        .leftJoinAndSelect('class.formTeachers', 'formTeacher', 'formTeacher.sessionId = :sessionId', { sessionId: currentSession.id })
        .leftJoinAndSelect('formTeacher.teacher', 'teacher');
    }

    if (level) {
      queryBuilder.andWhere('class.level = :level', { level });
    }

    if (search) {
      queryBuilder.andWhere('class.className ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * perPage)
      .take(perPage)
      .orderBy('class.className', 'ASC')
      .addOrderBy('class.arm', 'ASC')
      .getManyAndCount();

    // Transform data to include form_teacher at root level
    const transformedData = data.map((classEntity) => ({
      ...classEntity,
      form_teacher: classEntity.formTeachers?.[0]?.teacher || null,
      students_count: classEntity.students?.length || 0,
    }));

    return {
      success: true,
      data: transformedData,
      meta: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async findOne(id: number) {
    const classEntity = await this.classRepository.findOne({
      where: { id },
      relations: ['students'],
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    // Get current session
    const currentSession = await this.sessionRepository.findOne({
      where: { isCurrent: true },
    });

    // Get form teacher for current session
    let formTeacher = null;
    if (currentSession) {
      const formTeacherAssignment = await this.formTeacherRepository.findOne({
        where: { classId: id, sessionId: currentSession.id },
        relations: ['teacher'],
      });
      formTeacher = formTeacherAssignment?.teacher || null;
    }

    // Transform data to include form_teacher at root level
    const transformedData = {
      ...classEntity,
      form_teacher: formTeacher,
      students_count: classEntity.students?.length || 0,
    };

    return {
      success: true,
      data: transformedData,
    };
  }

  async update(id: number, updateClassDto: UpdateClassDto) {
    const classEntity = await this.classRepository.findOne({ where: { id } });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    const { formTeacherId, ...classData } = updateClassDto;
    Object.assign(classEntity, classData);
    const updated = await this.classRepository.save(classEntity);

    let credentials = null;

    // Handle form teacher assignment
    if (formTeacherId !== undefined) {
      if (formTeacherId) {
        // Check if the form teacher is actually changing
        const currentSession = await this.sessionRepository.findOne({
          where: { isCurrent: true },
        });

        let currentFormTeacherId = null;
        if (currentSession) {
          const existingAssignment = await this.formTeacherRepository.findOne({
            where: { classId: id, sessionId: currentSession.id },
          });
          currentFormTeacherId = existingAssignment?.teacherId || null;
        }

        // Only assign and generate credentials if form teacher is different
        if (currentFormTeacherId !== formTeacherId) {
          const result = await this.assignFormTeacher(id, formTeacherId);
          credentials = result.credentials;
        }
        // If same teacher, no credentials are returned (they keep their existing ones)
      } else {
        // Remove form teacher assignment
        await this.removeFormTeacher(id);
      }
    }

    return {
      success: true,
      data: updated,
      credentials,
      message: 'Class updated successfully',
    };
  }

  async remove(id: number) {
    const classEntity = await this.classRepository.findOne({ where: { id } });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    await this.classRepository.remove(classEntity);

    return {
      success: true,
      message: 'Class deleted successfully',
    };
  }

  async getStudents(id: number, page: number = 1, perPage: number = 20) {
    const classEntity = await this.classRepository.findOne({ where: { id } });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    const [data, total] = await this.studentRepository.findAndCount({
      where: { currentClassId: id },
      skip: (page - 1) * perPage,
      take: perPage,
      order: { firstName: 'ASC' },
    });

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

  async getSubjects(id: number) {
    const classEntity = await this.classRepository.findOne({
      where: { id },
      relations: ['classSubjects', 'classSubjects.subject'],
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    // Get teacher assignments for this class
    const teacherAssignments = await this.teacherSubjectClassRepository.find({
      where: { classId: id },
      relations: ['teacher', 'subject'],
    });

    // Map subjects with their teachers
    const subjectsWithTeachers = classEntity.classSubjects.map((cs) => {
      const teacherAssignment = teacherAssignments.find(
        (ta) => ta.subjectId === cs.subjectId,
      );
      return {
        ...cs,
        teacher: teacherAssignment?.teacher || null,
      };
    });

    return {
      success: true,
      data: subjectsWithTeachers,
    };
  }

  async assignSubject(classId: number, subjectId: number) {
    const existing = await this.classSubjectRepository.findOne({
      where: { classId, subjectId },
    });

    if (existing) {
      throw new ConflictException('Subject already assigned to this class');
    }

    const classSubject = this.classSubjectRepository.create({
      classId,
      subjectId,
    });
    const saved = await this.classSubjectRepository.save(classSubject);

    const result = await this.classSubjectRepository.findOne({
      where: { id: saved.id },
      relations: ['class', 'subject'],
    });

    return {
      success: true,
      data: result,
      message: 'Subject assigned to class successfully',
    };
  }

  async removeSubject(classId: number, subjectId: number) {
    const classSubject = await this.classSubjectRepository.findOne({
      where: { classId, subjectId },
    });

    if (!classSubject) {
      throw new NotFoundException('Subject assignment not found');
    }

    await this.classSubjectRepository.remove(classSubject);

    return {
      success: true,
      message: 'Subject removed from class successfully',
    };
  }

  async getResultsSummary(
    id: number,
    termId?: number,
    sessionId?: number,
  ) {
    const classEntity = await this.classRepository.findOne({
      where: { id },
      relations: ['results', 'results.student', 'results.subject'],
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    let results = classEntity.results;

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

  async getAttendanceSummary(
    id: number,
    termId?: number,
    sessionId?: number,
  ) {
    const classEntity = await this.classRepository.findOne({
      where: { id },
      relations: ['attendance', 'attendance.student'],
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    let attendance = classEntity.attendance;

    if (termId) {
      attendance = attendance.filter((a) => a.termId === termId);
    }

    if (sessionId) {
      attendance = attendance.filter((a) => a.sessionId === sessionId);
    }

    return {
      success: true,
      data: attendance,
    };
  }

  /**
   * Assign a teacher as form teacher for a class
   * This will create user credentials if the teacher doesn't have them
   */
  async assignFormTeacher(classId: number, teacherId: number) {
    // Get the current session
    const currentSession = await this.sessionRepository.findOne({
      where: { isCurrent: true },
    });

    if (!currentSession) {
      throw new NotFoundException('No current session set. Please set a current session first.');
    }

    // Get the teacher
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId },
      relations: ['user', 'user.role'],
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }

    // Check if this class already has a form teacher for this session
    const existingFormTeacher = await this.formTeacherRepository.findOne({
      where: { classId, sessionId: currentSession.id },
    });

    if (existingFormTeacher) {
      // Update existing assignment
      existingFormTeacher.teacherId = teacherId;
      await this.formTeacherRepository.save(existingFormTeacher);
    } else {
      // Create new form teacher assignment
      const formTeacher = this.formTeacherRepository.create({
        teacherId,
        classId,
        sessionId: currentSession.id,
      });
      await this.formTeacherRepository.save(formTeacher);
    }

    // Always generate new credentials for form teacher assignment
    let credentials = null;

    // Get the Form Teacher role
    const formTeacherRole = await this.roleRepository.findOne({
      where: { roleName: ROLES.FORM_TEACHER },
    });

    if (!formTeacherRole) {
      throw new NotFoundException('Form Teacher role not found. Please run database seeding.');
    }

    // If teacher doesn't have any user credentials, create them with Form Teacher role
    if (!teacher.userId) {
      credentials = await this.createTeacherCredentials(teacher, formTeacherRole.id);
    } else {
      // Teacher already has credentials - regenerate password and return credentials
      const generatedPassword = generatePassword();
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);
      
      // Update existing user with new password and Form Teacher role
      teacher.user.password = hashedPassword;
      teacher.user.roleId = formTeacherRole.id;
      teacher.user.mustChangePassword = true;
      await this.userRepository.save(teacher.user);
      
      credentials = {
        username: teacher.user.username,
        password: generatedPassword,
      };
    }

    return {
      success: true,
      credentials,
      message: 'Form teacher assigned successfully',
    };
  }

  /**
   * Remove form teacher assignment for a class
   */
  async removeFormTeacher(classId: number) {
    // Get the current session
    const currentSession = await this.sessionRepository.findOne({
      where: { isCurrent: true },
    });

    if (!currentSession) {
      return { success: true, message: 'No form teacher to remove' };
    }

    await this.formTeacherRepository.delete({
      classId,
      sessionId: currentSession.id,
    });

    return {
      success: true,
      message: 'Form teacher removed successfully',
    };
  }

  /**
   * Create user credentials for a teacher
   */
  private async createTeacherCredentials(teacher: Teacher, roleId: number) {
    // Generate unique username
    let username = generateUsername(teacher.firstName, teacher.lastName);
    let usernameExists = await this.userRepository.findOne({ where: { username } });
    let counter = 1;
    
    while (usernameExists) {
      username = generateUsername(teacher.firstName, teacher.lastName) + counter;
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
      roleId,
      isActive: true,
      mustChangePassword: true,
    });

    const savedUser = await this.userRepository.save(user);

    // Update teacher with user reference
    teacher.userId = savedUser.id;
    await this.teacherRepository.save(teacher);

    return {
      username,
      password: generatedPassword,
    };
  }
}
