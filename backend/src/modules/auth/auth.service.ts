import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { Student, StudentStatus } from '../../entities/student.entity';
import { Teacher } from '../../entities/teacher.entity';
import { Class } from '../../entities/class.entity';
import { LoginDto, ChangePasswordDto, RequestPasswordResetDto, ResetPasswordDto } from './dto/auth.dto';
import { AuthResponse, JwtPayload, PasswordResetResponse } from './interfaces/auth.interface';
import { generatePassword } from '../../utils/generators.util';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({
      where: { username: loginDto.username },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Find associated teacher or student record
    let teacherId: number | null = null;
    let studentId: number | null = null;
    
    if (user.role.roleName === 'Form Teacher' || user.role.roleName === 'Subject Teacher') {
      const teacher = await this.teacherRepository.findOne({
        where: { userId: user.id },
      });
      if (teacher) {
        teacherId = teacher.id;
      }
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      roleId: user.roleId,
      roleName: user.role.roleName,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: '365d', // Refresh token lasts 1 year
      }),
      user: {
        id: user.id,
        username: user.username,
        role: user.role.roleName,
        mustChangePassword: user.mustChangePassword,
        teacherId,
        studentId,
      },
    };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(changePasswordDto.oldPassword, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.password = hashedPassword;
    user.mustChangePassword = false;

    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }

  async requestPasswordReset(requestDto: RequestPasswordResetDto): Promise<PasswordResetResponse> {
    const user = await this.userRepository.findOne({
      where: { username: requestDto.username },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return { message: 'If the username exists, a reset token has been generated' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.userRepository.save(user);

    // In production, send email with resetToken
    // For now, return it in response (development only)
    return {
      message: 'Password reset token generated',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
    };
  }

  async resetPassword(resetDto: ResetPasswordDto): Promise<{ message: string }> {
    const users = await this.userRepository.find({
      where: { isActive: true },
    });

    let userToReset: User | null = null;

    for (const user of users) {
      if (
        user.passwordResetToken &&
        user.passwordResetExpires &&
        user.passwordResetExpires > new Date()
      ) {
        const isTokenValid = await bcrypt.compare(resetDto.token, user.passwordResetToken);
        if (isTokenValid) {
          userToReset = user;
          break;
        }
      }
    }

    if (!userToReset) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(resetDto.newPassword, 10);
    userToReset.password = hashedPassword;
    userToReset.passwordResetToken = null;
    userToReset.passwordResetExpires = null;
    userToReset.mustChangePassword = false;

    await this.userRepository.save(userToReset);

    return { message: 'Password reset successfully' };
  }

  async getCurrentUser(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role.roleName,
      roleId: user.roleId,
      isActive: user.isActive,
      mustChangePassword: user.mustChangePassword,
    };
  }

  async refreshToken(userId: number): Promise<{ access_token: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid user');
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      roleId: user.roleId,
      roleName: user.role.roleName,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Get public stats for the login page (no auth required)
   */
  async getPublicStats(): Promise<{ students: number; teachers: number; classes: number }> {
    const [students, teachers, classes] = await Promise.all([
      this.studentRepository.count({ where: { status: StudentStatus.ACTIVE } }),
      this.teacherRepository.count({ where: { status: 'Active' } }),
      this.classRepository.count(),
    ]);

    return {
      students,
      teachers,
      classes,
    };
  }
}
