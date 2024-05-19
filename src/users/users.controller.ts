import { Controller, Get, UseGuards, Request, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('user')
@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req) {
    try {
      this.logger.log(`User Profile Requested: ${JSON.stringify(req.user)}`);
      if (!req.user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return req.user;
    } catch (error) {
      this.logger.error(`Error fetching user profile: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'An unexpected error occurred',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
