import { Module } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { TwilioController } from './twilio.controller';
import { CallLogsModule } from '../call-logs/call-logs.module';
import { EventsGateway } from '../gateway.socket';

@Module({
  imports : [CallLogsModule],
  controllers: [TwilioController],
  providers: [TwilioService,EventsGateway],
})
export class TwilioModule {}
