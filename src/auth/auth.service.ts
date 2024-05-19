import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    this.logger.log(`Validating user: ${email}`);
    const user = await this.userService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      this.logger.log(`User validated: ${email}`);
      return {
        id: user._id,
        name: user.name,
        email: user.email,
      };
    }
    this.logger.warn(`Validation failed for user: ${email}`);
    return null;
  }

  async login(loginDto: LoginDto) {
    this.logger.log(`Login attempt for user: ${loginDto.email}`);
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      this.logger.warn(`Login failed for user: ${loginDto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { email: user.email, sub: user._id };
    const token = this.jwtService.sign(payload);
    this.logger.log(`Login successful for user: ${loginDto.email}`);
    return {
      email: user.email,
      name: user.name,
      id: user._id,
      access_token: token,
    };
  }

  async signup(signupDto: SignupDto) {
    this.logger.log(`Signup attempt for user: ${signupDto.email}`);
    const existingUser = await this.userService.findOneByEmail(signupDto.email);
    if (existingUser) {
      this.logger.warn(`Signup failed - User already exists: ${signupDto.email}`);
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);
    const user = await this.userService.create({
      ...signupDto,
      password: hashedPassword,
    });

    const payload = { email: user.email, sub: user._id };
    const access_token = this.jwtService.sign(payload);
    this.logger.log(`Signup successful for user: ${signupDto.email}`);

    return {
      email: user.email,
      name: user.name,
      id: user._id,
      access_token,
    };
  }
}
