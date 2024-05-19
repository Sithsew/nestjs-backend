import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './users.controller';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile', () => {
      const user = { id: 1, username: 'testuser' };
      const req = { user };

      const result = controller.getProfile(req);

      expect(result).toBe(user);
    });

    it('should throw HttpException if user is not found', () => {
      const req = { user: null };

      expect(() => controller.getProfile(req)).toThrowError(HttpException);
    });

    it('should throw HttpException with status 404 if user is not found', () => {
      const req = { user: null };

      try {
        controller.getProfile(req);
      } catch (error) {
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should throw HttpException with custom message if user is not found', () => {
      const req = { user: null };

      try {
        controller.getProfile(req);
      } catch (error) {
        expect(error.message).toBe('User not found');
      }
    });

    it('should throw HttpException with status 500 if an unexpected error occurs', () => {
      const req = { user: 'sithara' };
      const error = new Error('An unexpected error occurred');

      try {
        controller.getProfile(req);
      } catch (error) {
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });

    it('should throw HttpException with error message if an unexpected error occurs', () => {
      const req = { user: 'sithara' };
      const error = new Error('An unexpected error occurred');

      try {
        controller.getProfile(req);
      } catch (error) {
        expect(error.message).toBe('An unexpected error occurred');
      }
    });
  });
});
