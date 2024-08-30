import { Injectable } from '@nestjs/common';
import { UserRole } from 'src/common/enums/roles.enum';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class UserSeeder {
  constructor(private readonly usersService: UsersService) {}

  async seed() {
    const users: Partial<UserEntity>[] = [
      {
        firstname: 'Admin',
        lastname: 'User',
        username: 'admin',
        email: 'admin@example.com',
        phoneNumber: '1234567890',
        password: 'adminpassword',
        role: UserRole.ADMIN,
      },
      {
        firstname: 'John',
        lastname: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        phoneNumber: '0987654321',
        password: 'johndoe123',
        role: UserRole.AGENT,
      },
    ];

    for (const user of users) {
        await this.usersService.create(user as UserEntity);
      }
    }
  }
