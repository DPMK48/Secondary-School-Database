import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { JwtPayload } from '../interfaces/auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'your-super-secret-jwt-key'),
    });
  }

  async validate(payload: JwtPayload) {
    // Fetch user from database to ensure they still exist
    const user = await this.usersRepository.findOne({
      where: { id: payload.sub },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return {
      userId: user.id,
      username: user.username,
      roleId: user.roleId,
      roleName: user.role?.roleName || 'Unknown',
    };
  }
}

