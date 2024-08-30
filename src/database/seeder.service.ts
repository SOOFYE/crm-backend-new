import { Injectable } from '@nestjs/common';
import { UserSeeder } from './seeds/user.seed';


@Injectable()
export class SeederService {
  constructor(private readonly userSeeder: UserSeeder) {}

  async seed() {
    await this.userSeeder.seed();
    // Call other seed methods for different entities here
  }
}