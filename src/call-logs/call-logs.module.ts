import { Module } from '@nestjs/common';
import { CallLogsService } from './call-logs.service';
import { CallLogsController } from './call-logs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallLogEntity } from './entities/call-log.entity';

@Module({
  imports : [TypeOrmModule.forFeature([CallLogEntity])],
  controllers: [CallLogsController],
  providers: [CallLogsService],
  exports : [CallLogsService]
})
export class CallLogsModule {}
