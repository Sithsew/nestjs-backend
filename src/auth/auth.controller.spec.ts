import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { ConflictException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            signup: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return login result if login is successful', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const expectedResult = {
        email: 'test@example.com',
        name: 'Test User',
        id: '1',
        access_token: 'token',
      };
      jest.spyOn(authService, 'login').mockResolvedValueOnce(expectedResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Login successful!',
        data: expectedResult,
      });
    });

    it('should rethrow error if login fails', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      jest
        .spyOn(authService, 'login')
        .mockRejectedValueOnce(new Error('Some error'));

      await expect(controller.login(loginDto)).rejects.toThrowError(
        'Some error',
      );
    });
  });

  describe('signup', () => {
    it('should return signup result if signup is successful', async () => {
      const signupDto: SignupDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      };
      const expectedResult = {
        email: 'test@example.com',
        name: 'Test User',
        id: '1',
        access_token: 'token',
      };
      jest.spyOn(authService, 'signup').mockResolvedValueOnce(expectedResult);

      const result = await controller.signup(signupDto);

      expect(result).toEqual({
        statusCode: 201,
        message: 'Account created successfully!',
        data: expectedResult,
      });
    });

    it('should rethrow error if signup fails with a non-ConflictException', async () => {
      const signupDto: SignupDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      };
      jest
        .spyOn(authService, 'signup')
        .mockRejectedValueOnce(new Error('User already exists'));

      await expect(controller.signup(signupDto)).rejects.toThrowError(
        'User already exists',
      );
    });

    it('should throw ConflictException if signup fails with a ConflictException', async () => {
      const signupDto: SignupDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      };
      jest
        .spyOn(authService, 'signup')
        .mockRejectedValueOnce(new ConflictException());

      await expect(controller.signup(signupDto)).rejects.toThrowError(
        ConflictException,
      );
    });
  });
});
