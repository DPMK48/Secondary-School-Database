import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActivitiesService, ActivityQueryDto } from './activities.service';
import { ActivityType } from '../../entities/activity.entity';

@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  /**
   * Get recent activities
   * GET /api/activities/recent?limit=10
   */
  @Get('recent')
  async getRecentActivities(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const activities = await this.activitiesService.findRecent({ limit });
    return activities.map(activity => ({
      id: activity.id.toString(),
      type: activity.type,
      title: activity.title,
      description: activity.description,
      timestamp: activity.createdAt.toISOString(),
      user: activity.user?.username || activity.userRole || 'System',
      userRole: activity.userRole,
      metadata: activity.metadata,
    }));
  }

  /**
   * Get all activities (paginated)
   * GET /api/activities?limit=20&offset=0
   */
  @Get()
  async getAllActivities(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('type') type?: ActivityType,
    @Query('userId') userId?: string,
    @Query('userRole') userRole?: string,
  ) {
    const query: ActivityQueryDto = {
      limit,
      offset,
      type,
      userRole,
    };

    if (userId) {
      query.userId = parseInt(userId, 10);
    }

    const { data, total } = await this.activitiesService.findAll(query);

    return {
      data: data.map(activity => ({
        id: activity.id.toString(),
        type: activity.type,
        title: activity.title,
        description: activity.description,
        timestamp: activity.createdAt.toISOString(),
        user: activity.user?.username || activity.userRole || 'System',
        userRole: activity.userRole,
        metadata: activity.metadata,
      })),
      meta: {
        total,
        limit,
        offset,
      },
    };
  }

  /**
   * Get activities for current user
   * GET /api/activities/my?limit=10
   */
  @Get('my')
  async getMyActivities(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('userId', new DefaultValuePipe(0), ParseIntPipe) userId: number,
  ) {
    if (!userId) {
      return [];
    }

    const activities = await this.activitiesService.findByUser(userId, limit);
    return activities.map(activity => ({
      id: activity.id.toString(),
      type: activity.type,
      title: activity.title,
      description: activity.description,
      timestamp: activity.createdAt.toISOString(),
      user: activity.user?.username || activity.userRole || 'System',
      userRole: activity.userRole,
      metadata: activity.metadata,
    }));
  }

  /**
   * Get activities by role
   * GET /api/activities/by-role?role=Admin&limit=10
   */
  @Get('by-role')
  async getActivitiesByRole(
    @Query('role') role: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    if (!role) {
      return [];
    }

    const activities = await this.activitiesService.findByRole(role, limit);
    return activities.map(activity => ({
      id: activity.id.toString(),
      type: activity.type,
      title: activity.title,
      description: activity.description,
      timestamp: activity.createdAt.toISOString(),
      user: activity.user?.username || activity.userRole || 'System',
      userRole: activity.userRole,
      metadata: activity.metadata,
    }));
  }
}
