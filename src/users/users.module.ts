import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UtilsModule } from 'src/utils/utils.module';
import { S3Module } from '../s3/s3.module';


@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]),UtilsModule,S3Module],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export UsersService for use in other modules
})
export class UsersModule {}
