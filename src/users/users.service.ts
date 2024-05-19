import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOneByEmail(email: string): Promise<User | undefined> {
    this.logger.log(`Searching for user with email: ${email}`);
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      this.logger.warn(`User with email: ${email} not found`);
    }
    return user;
  }

  async create(createUserDto: any): Promise<User> {
    this.logger.log(`Creating user with email: ${createUserDto.email}`);
    const createdUser = new this.userModel(createUserDto);
    const savedUser = await createdUser.save();
    this.logger.log(`User created successfully with email: ${createUserDto.email}`);
    return savedUser;
  }

  async findAll(): Promise<User[]> {
    this.logger.log('Fetching all users');
    const users = await this.userModel.find().exec();
    this.logger.log(`Found ${users.length} users`);
    return users;
  }
}
