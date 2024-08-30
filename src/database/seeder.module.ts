import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module';
import { SeederService } from './seeder.service';
import { UserSeeder } from './seeds/user.seed';

@Module({
  imports: [UsersModule], // Import any modules required for seeding
  providers: [SeederService, UserSeeder], // Provide SeederService and individual seeders
  exports: [SeederService], // Export SeederService if needed elsewhere
})
export class SeederModule {}