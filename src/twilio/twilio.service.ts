import { Injectable } from '@nestjs/common';
import { CreateTwilioDto } from './dto/create-twilio.dto';
import { UpdateTwilioDto } from './dto/update-twilio.dto';
import { Twilio } from 'twilio';

@Injectable()
export class TwilioService {

  private twilioClient: Twilio;

  private readonly accountSid = process.env.TWILIO_ACCOUNT_SID;
  private readonly apiKey = process.env.TWILIO_API_KEY;
  private readonly apiSecret = process.env.TWILIO_API_SECRET;
  private readonly twilioAppSid = process.env.TWILIO_APP_SID; 


  constructor() {
    this.twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }

  async initiateCallToCustomer(customerNumber: string, agentNumber: string): Promise<any> {
    console.log(customerNumber,agentNumber )
    return this.twilioClient.calls.create({
      to: customerNumber,
      from: agentNumber,  
      url: process.env.TWIML_URL,      
      statusCallback: process.env.STATUS_CALLBACK_URL,  
      statusCallbackEvent: ['initiated','ringing','in-progress','completed','failed', 'busy', 'no-answer', 'canceled'],
    });
  }


  async addToConference(participantNumber: string) {
    const conferenceName = 'Conf_12345';  // TODO: Get the actual ongoing conference name
    
    await this.twilioClient.calls.create({
      to: participantNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
      url: `${process.env.BASE_URL}/twiml/conference?name=${conferenceName}`,
    });
  }
  
}
