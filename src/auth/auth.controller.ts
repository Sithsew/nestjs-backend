import {
  Controller,
  Post,
  Body,
  Logger,
  HttpCode,
  HttpStatus,
  ConflictException,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`Login attempt for user: ${loginDto.email}`);
    try {
      const result = await this.authService.login(loginDto);
      this.logger.log(`Login successful for user: ${loginDto.email}`);
      return {
        statusCode: HttpStatus.OK,
        message: 'Login successful!',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Login failed for user: ${loginDto.email}`, error.stack);
      throw error;
    }
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'User signup' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiBody({ type: SignupDto })
  async signup(@Body() signupDto: SignupDto) {
    this.logger.log(`Signup attempt for user: ${signupDto.email}`);
    try {
      const result = await this.authService.signup(signupDto);
      this.logger.log(`Account created successfully for user: ${signupDto.email}`);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Account created successfully!',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Signup failed for user: ${signupDto.email}`, error.stack);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new ConflictException('User already exists');
    }
  }
}
