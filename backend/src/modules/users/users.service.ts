import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { CreateUserDto, UpdateUserDto, QueryUsersDto } from './dto/users.dto';
import { paginate, PaginatedResult } from '../../common/helpers/pagination.helper';
import { generatePassword } from '../../utils/generators.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<{ user: User; generatedPassword?: string }> {
    // Check if username already exists
    const existingUser = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    let generatedPassword: string | undefined;
    let password = createUserDto.password;

    // If no password provided, generate one
    if (!password) {
      generatedPassword = generatePassword();
      password = generatedPassword;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      mustChangePassword: true, // Always true for new users
    });

    const savedUser = await this.userRepository.save(user);

    return {
      user: savedUser,
      generatedPassword, // Return generated password if applicable
    };
  }

  async findAll(query: QueryUsersDto): Promise<PaginatedResult<User>> {
    const { page = 1, limit = 20, roleId, isActive } = query;

    const where: any = {};
    if (roleId) where.roleId = roleId;
    if (isActive !== undefined) where.isActive = isActive;

    return paginate(this.userRepository, page, limit, where, ['role']);
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // If username is being updated, check for conflicts
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });

      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<{ message: string }> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return { message: `User with ID ${id} has been deleted` };
  }

  async resetUserPassword(id: number): Promise<{ newPassword: string }> {
    const user = await this.findOne(id);

    const newPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.mustChangePassword = true;

    await this.userRepository.save(user);

    return { newPassword };
  }
}
