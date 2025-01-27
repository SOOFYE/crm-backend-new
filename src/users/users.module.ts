import { TypeOrmModule } from "@nestjs/typeorm";
import { S3Module } from "../s3/s3.module";
import { UtilsModule } from "../utils/utils.module";
import { UserEntity } from "./entities/user.entity";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { Module } from "@nestjs/common";



@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]),UtilsModule,S3Module],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export UsersService for use in other modules
})
export class UsersModule {}
