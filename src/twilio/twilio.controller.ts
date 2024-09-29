import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, Inject, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { TwilioService } from './twilio.service';
import { CallLogsService } from '../call-logs/call-logs.service';
import { CallStatusEnum } from '../common/enums/call-status.enum';
import { CallDirectionEnum } from '../common/enums/call-direction.enum';
import Redis from 'ioredis';

import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { ApiTags } from '@nestjs/swagger';
import { EventsGateway } from '../gateway.socket';





const twilio = require("twilio");
const VoiceResponse = require('twilio').twiml.VoiceResponse
const AccessToken = twilio.jwt.AccessToken;
const { VoiceGrant } = AccessToken;


@ApiTags('Twilio')
@Controller('twilio')
export class TwilioController {
  constructor(
    private readonly twilioService: TwilioService,
    private readonly callLogsService: CallLogsService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,  
    private readonly eventsGateway: EventsGateway
  ) {}

  @Get('token')
  async generateToken(@Res() res: Response) {
    const identity = 'agent_' + Math.random().toString(36).substr(2, 9);  // Unique agent identity

    // Create a new voice grant
    const voiceGrant = new VoiceGrant({
      // incomingAllow: true,  // Allow incoming calls (optional)
      outgoingApplicationSid : 'APfb9c5a337922a20c534c94b94148f785'
    });

    // Create an access token
    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET,
      { identity: identity }
    );

    token.addGrant(voiceGrant);

    // Send token to the client
    res.json({ token: token.toJwt() });
  }


  @Post('call')
  async makeCall(@Body() body: any, @Res() res: Response) {
    const { customerNumber, agentNumber } = body;

    try {
      const call = await this.twilioService.initiateCallToCustomer(customerNumber, agentNumber || '+17175430074');
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Call initiated successfully',
        callSid: call.sid,
      });
    } catch (error) {
      console.log(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to initiate call',
        error: error.message,
      });
    }
  }



  // @Post('voice')
  // handleTwimlVoiceResponse(@Body() body, @Res() res: Response) {
  //   let customerNumber = body.To;

  //   console.log(body)

  //   console.log("CUSTOMER",customerNumber)

  //   const response = new VoiceResponse();

  //   const dial = response.dial(); //TODO: req.user.agent.assignedPhoneNumber 
  //   dial.number({
  //     statusCallbackEvent: 'initiated ringing answered completed no-answer busy canceled in-progress failed',
  //     statusCallback: 'https://mycrmbackendtwilio.loca.lt/twilio/status-callback',
  //     statusCallbackMethod: 'POST'
  //   },
  //     customerNumber)
  //   res.set("Content-Type","text/xml");
  //   res.send(response.toString())
    

  // }


  @Post('voice')
  handleTwimlVoiceResponse(@Body() body, @Res() res: Response) {
    const customerNumber = body.To;
    const agentNumber = '+17175430074'; // Default agent number if not provided
  
    const response = new VoiceResponse();
    
    const dial = response.dial({callerId: agentNumber})

    console.log(customerNumber,agentNumber)
    
  
    dial.number({
      statusCallbackEvent: 'initiated ringing answered completed no-answer busy canceled in-progress failed',
      statusCallback: 'https://mycrmbackendtwilio.loca.lt/twilio/status-callback',
      statusCallbackMethod: 'POST',
    }, customerNumber);
  
    res.set('Content-Type', 'text/xml');
    res.send(response.toString());
  
    // Emit real-time WebSocket event for call status update
    this.eventsGateway.server.emit('callStatus', { status: 'initiated', customerNumber, agentNumber });
  }
  

  @Post('status-callback')
  handleTwilioStatusCallback(@Body() body) {
    console.log('Status callback received:', body);

    const { CallStatus, CallSid } = body;

    // Emit WebSocket events based on the call status
    this.eventsGateway.server.emit('callStatus', { status: CallStatus, callSid: CallSid });
  }
  @Post('conference')
  handleTwimlConferenceResponse(@Req() req: Request, @Res() res: Response) {
    const conferenceName = `Conf_${Date.now()}`;  // Unique conference name

    const twiml = `
      <Response>
        <Dial>
          <Conference>${conferenceName}</Conference>
        </Dial>
      </Response>
    `;
    
    res.type('text/xml');
    res.send(twiml);
  }


  // @Post('status-callback')
  // async handleCallStatus(@Req() req: Request, @Res() res: Response) {
  //   const { CallSid, CallStatus, To, From } = req.body;

  //   console.log(`Call with SID ${CallSid} is now ${CallStatus}`);

  //   // You can store or log this information as per your business requirements

  //   res.status(200).send();
  // }


  // TODO: ACCEPT ALL callSTATUS CASES HERE PELASE!
  // @Post('status-callback')
  // async handleCallStatus(@Req() request: Request, @Res() response: Response) {
  //   const { CallStatus, CallSid, To, From, Duration, RecordingUrl } = request.body;

  //   // Retrieve agentId and campaignId from Redis using CallSid
  //   const agentId = await this.redisClient.hget(`call:${CallSid}`, 'agentId');
  //   const campaignId = await this.redisClient.hget(`call:${CallSid}`, 'campaignId');

  //   if (!agentId || !campaignId) {
  //     console.error(`Failed to retrieve agentId or campaignId for CallSid: ${CallSid}`);
  //     return response.status(500).send('Failed to retrieve agent or campaign details.');
  //   }

  //   // Map Twilio's CallStatus to our CallStatusEnum
  //   let callStatus: CallStatusEnum;
  //   switch (CallStatus) {
  //     case 'busy':
  //       callStatus = CallStatusEnum.BUSY;
  //       break;
  //     case 'failed':
  //       callStatus = CallStatusEnum.FAILED;
  //       break;
  //     case 'no-answer':
  //       callStatus = CallStatusEnum.NO_ANSWER;
  //       break;
  //     default:
  //       callStatus = CallStatusEnum.UNKNOWN;
  //   }

  //   // Log the call in the system using CallLogsService
  //   await this.callLogsService.createCallLog(
  //     { phoneNumber: To },   // Customer data
  //     agentId,               // Retrieved agentId from Redis
  //     campaignId,            // Retrieved campaignId from Redis
  //     callStatus,
  //     CallSid,
  //     CallDirectionEnum.OUTGOING,
  //     RecordingUrl,
  //     Duration,
  //     `Call status: ${callStatus}`  // Additional comments or status description
  //   );

  //   // Respond to Twilio's webhook
  //   response.status(200).send();
  // }
}
