import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findOneByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data if validation succeeds', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = {
        _id: '1',
        name: 'Test User',
        email,
        password: hashedPassword,
      };
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValueOnce(user);

      const result = await service.validateUser(email, password);

      expect(result).toEqual({ id: '1', name: 'Test User', email });
    });

    it('should return null if validation fails', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const hashedPassword = await bcrypt.hash('password', 10);
      const user = {
        _id: '1',
        name: 'Test User',
        email,
        password: hashedPassword,
      };
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValueOnce(user);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return user data and access token if login succeeds', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      const user = { _id: '1', name: 'Test User', email: loginDto.email };
      jest.spyOn(service, 'validateUser').mockResolvedValueOnce(user);
      const token = 'testtoken';
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce(token);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        email: user.email,
        name: user.name,
        id: user._id,
        access_token: token,
      });
    });

    it('should throw UnauthorizedException if login fails', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrongpassword' };
      jest.spyOn(service, 'validateUser').mockResolvedValueOnce(null);

      await expect(service.login(loginDto)).rejects.toThrowError(
        UnauthorizedException,
      );
    });
  });

  describe('signup', () => {
    it('should return user data and access token if signup succeeds', async () => {
      const signupDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      };
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValueOnce(null);
      const user = { _id: '1', ...signupDto };
      jest.spyOn(userService, 'create').mockResolvedValueOnce(user);
      const token = 'testtoken';
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce(token);

      const result = await service.signup(signupDto);

      expect(result).toEqual({
        email: user.email,
        name: user.name,
        id: user._id,
        access_token: token,
      });
    });

    it('should throw ConflictException if user already exists during signup', async () => {
      const signupDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      };
      jest
        .spyOn(userService, 'findOneByEmail')
        .mockResolvedValueOnce(signupDto as any);

      await expect(service.signup(signupDto)).rejects.toThrowError(
        ConflictException,
      );
    });
  });
});
