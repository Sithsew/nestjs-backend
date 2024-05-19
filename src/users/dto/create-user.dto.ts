import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'john_doe' })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'P@ssw0rd',
    description: 'Password must be at least 8 characters long and contain at least 1 letter, 1 number, and 1 special character',
  })
  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least 1 letter, 1 number, and 1 special character',
  })
  password: string;
}
