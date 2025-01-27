import { Injectable } from "@nestjs/common";
import { UserRole } from "../../common/enums/roles.enum";
import { UserEntity } from "../../users/entities/user.entity";
import { UsersService } from "../../users/users.service";


@Injectable()
export class UserSeeder {
  constructor(private readonly usersService: UsersService) {}

  async seed() {
    const users: Partial<UserEntity>[] = [
      {
        firstname: 'Sufyan',
        lastname: 'Imran',
        username: 'sufyanImran',
        email: 'syedsufyan36@gmail.com',
        phoneNumber: '1234567890',
        password: 'adminpassword123',
        role: UserRole.ADMIN,
        workingStartTime: new Date('2025-01-01T09:00:00Z'), // Example time
        workingEndTime: new Date('2025-01-01T17:00:00Z'), // Example time
        allowedBreakTimePerDay: '60',
        cnic: '12345-6789012-3',
        cnic_photo: '',
        bank_account: '123456789012345',
        address: '123 Main Street, Lahore',
        emergency_no: '9876543210',
      },
    ];


    for (const user of users) {
        await this.usersService.create(user as UserEntity);
      }
    }
  }
