import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

describe('UserService', () => {
  let service: UserService;
  let userModel: Model<any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<Model<any>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneByEmail', () => {
    it('should find and return a user by email', async () => {
      const email = 'test@example.com';
      const user = { email } as User;
      jest
        .spyOn(userModel, 'findOne')
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce(user),
        } as any);

      const result = await service.findOneByEmail(email);

      expect(result).toBe(user);
      expect(userModel.findOne).toHaveBeenCalledWith({ email });
    });

    it('should return null if user is not found', async () => {
      const email = 'test@example.com';
      jest
        .spyOn(userModel, 'findOne')
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce(null),
        } as any);

      const result = await service.findOneByEmail(email);

      expect(result).toBeNull();
      expect(userModel.findOne).toHaveBeenCalledWith({ email });
    });
  });

  describe('findAll', () => {
    it('should find and return all users', async () => {
      const users = [
        { email: 'test1@example.com' },
        { email: 'test2@example.com' },
      ] as User[];
      jest
        .spyOn(userModel, 'find')
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce(users),
        } as any);

      const result = await service.findAll();

      expect(result).toBe(users);
      expect(userModel.find).toHaveBeenCalledWith();
    });

    it('should return an empty array if no users are found', async () => {
      jest
        .spyOn(userModel, 'find')
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce([]),
        } as any);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(userModel.find).toHaveBeenCalledWith();
    });
  });
});
