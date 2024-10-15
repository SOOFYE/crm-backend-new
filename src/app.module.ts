import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtMiddleware } from './middlewares/jwt.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { IsUniqueConstraint } from './common/validators/is-unique.validator';
import { CampaignsModule } from './campaigns/campaigns.module';
import { CampaignTypesModule } from './campaign-types/campaign-types.module';
import { OrignalCampaignDataModule } from './orignal-campaign-data/orignal-campaign-data.module';
import { CampaignDataModule } from './campaign-data/campaign-data.module';
import { S3Module } from './s3/s3.module';
import { JobsModule } from './job-service/job-service.module';
import { FormsModule } from './forms/forms.module';
import { LeadsModule } from './leads/leads.module';
import { AttendanceModule } from './attendance/attendance.module';
import { HolidaysModule } from './holidays/holidays.module';
import { RedisModule } from './redis/redis.module';


@Module({
  imports: [
    RedisModule, 
    DatabaseModule, 
    UsersModule,  
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    AuthModule,
    CampaignsModule,
    CampaignTypesModule,
    OrignalCampaignDataModule,
    CampaignDataModule,
    S3Module,
    JobsModule,
    FormsModule,
    LeadsModule,
    AttendanceModule,
    HolidaysModule], 
  controllers: [AppController],
  providers: [AppService,IsUniqueConstraint],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes('*');
  }
}
