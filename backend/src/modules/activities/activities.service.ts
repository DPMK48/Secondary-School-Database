import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity, ActivityType } from '../../entities/activity.entity';

export interface CreateActivityDto {
  type: ActivityType;
  title: string;
  description: string;
  userId?: number;
  userRole?: string;
  metadata?: Record<string, any>;
}

export interface ActivityQueryDto {
  limit?: number;
  offset?: number;
  type?: ActivityType;
  userId?: number;
  userRole?: string;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  /**
   * Create a new activity log
   */
  async create(createActivityDto: CreateActivityDto): Promise<Activity> {
    const activity = this.activityRepository.create(createActivityDto);
    return this.activityRepository.save(activity);
  }

  /**
   * Log an activity (convenience method)
   */
  async logActivity(
    type: ActivityType,
    title: string,
    description: string,
    userId?: number,
    userRole?: string,
    metadata?: Record<string, any>,
  ): Promise<Activity> {
    return this.create({
      type,
      title,
      description,
      userId,
      userRole,
      metadata,
    });
  }

  /**
   * Get recent activities with optional filters
   */
  async findRecent(query: ActivityQueryDto = {}): Promise<Activity[]> {
    const { limit = 10, offset = 0, type, userId, userRole, startDate, endDate } = query;

    const qb = this.activityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.user', 'user')
      .orderBy('activity.createdAt', 'DESC')
      .take(limit)
      .skip(offset);

    if (type) {
      qb.andWhere('activity.type = :type', { type });
    }

    if (userId) {
      qb.andWhere('activity.userId = :userId', { userId });
    }

    if (userRole) {
      qb.andWhere('activity.userRole = :userRole', { userRole });
    }

    if (startDate) {
      qb.andWhere('activity.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('activity.createdAt <= :endDate', { endDate });
    }

    return qb.getMany();
  }

  /**
   * Get all activities (paginated)
   */
  async findAll(query: ActivityQueryDto = {}): Promise<{ data: Activity[]; total: number }> {
    const { limit = 20, offset = 0, type, userId, userRole, startDate, endDate } = query;

    const qb = this.activityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.user', 'user')
      .orderBy('activity.createdAt', 'DESC');

    if (type) {
      qb.andWhere('activity.type = :type', { type });
    }

    if (userId) {
      qb.andWhere('activity.userId = :userId', { userId });
    }

    if (userRole) {
      qb.andWhere('activity.userRole = :userRole', { userRole });
    }

    if (startDate) {
      qb.andWhere('activity.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('activity.createdAt <= :endDate', { endDate });
    }

    const [data, total] = await qb.take(limit).skip(offset).getManyAndCount();

    return { data, total };
  }

  /**
   * Get activities for a specific user
   */
  async findByUser(userId: number, limit: number = 10): Promise<Activity[]> {
    return this.findRecent({ userId, limit });
  }

  /**
   * Get activities by role (Admin, Subject Teacher, Form Teacher)
   */
  async findByRole(userRole: string, limit: number = 10): Promise<Activity[]> {
    return this.findRecent({ userRole, limit });
  }

  /**
   * Delete old activities (cleanup utility)
   */
  async deleteOldActivities(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.activityRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}
