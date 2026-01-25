import { Controller, Post, Body, UseGuards, Get, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, ChangePasswordDto, RequestPasswordResetDto, ResetPasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Public endpoint to get stats for login page
   */
  @Get('public-stats')
  async getPublicStats() {
    return this.authService.getPublicStats();
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout() {
    // For JWT, logout is typically handled client-side
    // by removing the token
    return { message: 'Logged out successfully' };
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refreshToken(@CurrentUser() user: any) {
    return this.authService.refreshToken(user.userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: any) {
    return this.authService.getCurrentUser(user.userId);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.userId, changePasswordDto);
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body() requestDto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(requestDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetDto);
  }
}
