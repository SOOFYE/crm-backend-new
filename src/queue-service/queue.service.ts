import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { AgentStatus } from '../common/enums/agents-status.enum';
import { TwilioService } from '../twilio/twilio.service';

@Injectable()
export class QueueService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly twilioService: TwilioService
  
  ) {}


  async registerAgentToRedisArray(agentId: string, phoneNumber: string, campaignId: string): Promise<void> {
    await this.redisClient.hset(`agent:${agentId}`, {
      phoneNumber,
      campaignId,
      status: AgentStatus.PAUSED,  // Default status set to paused
    });
  }

  async removeAgentFromRedis(agentId: string): Promise<void> {
    await this.redisClient.del(`agent:${agentId}`);
  }

  async addFilteredDataToQueue(campaignId: string, filteredData: any[]): Promise<void> {
    for (const data of filteredData) {
      await this.redisClient.lpush(`campaign:${campaignId}:queue`, JSON.stringify(data));
    }
  }

  async startDialing(agentId: string, campaignId: string): Promise<void> {
    const agentStatus = await this.redisClient.hget(`agent:${agentId}`, 'status');
    const agentNumber = await this.redisClient.hget(`agent:${agentId}`, 'phoneNumber');

    if (agentStatus === AgentStatus.PAUSED || agentStatus === AgentStatus.ON_CALL ) {
      return;  // If agent is paused, do not make any calls
    }

    const customerData = await this.getNextCustomerForAgent(agentId, campaignId);

    if (customerData) {
      // Update agent status to 'on_call'
      await this.redisClient.hset(`agent:${agentId}`, 'status', AgentStatus.ON_CALL);
      await this.redisClient.hset(`agent:${agentId}`, 'currentCustomer', JSON.stringify(customerData));

      // Initiate the call using Twilio
      const call = await this.twilioService.initiateCallToCustomer(customerData.phoneNumber, agentNumber);

      const callSid = call.sid;  // Get Twilio CallSid for further reference
      console.log(`Call initiated with CallSid: ${callSid}`);

  
      // Save CallSid to Redis to link the call with agent and campaign
      await this.redisClient.hset(`call:${callSid}`, 'agentId', agentId);
      await this.redisClient.hset(`call:${callSid}`, 'campaignId', campaignId);
  
      // Optional: Set an expiration for the metadata in Redis
      await this.redisClient.expire(`call:${callSid}`, 24 * 60 * 60);  // Expire in 24 hours
    } else {
      console.log('No customer available or already locked.');
    }
  }

  /**
   * Get the next customer for the agent to call, ensuring no duplicate calls with locking.
   */
  async getNextCustomerForAgent(agentId: string, campaignId: string): Promise<any | null> {
    const customerDataString = await this.redisClient.rpop(`campaign:${campaignId}:queue`);
    
    if (customerDataString) {
      const customerData = JSON.parse(customerDataString);

      // Try to lock the customer data to prevent simultaneous calls
      const lockKey = `customer_lock:${customerData.id}`; // Assuming customerData contains an 'id' field
     
      // @ts-ignore
      const lockAcquired = await this.redisClient.set(lockKey, 'locked', 'NX', 'EX', 30); // Lock for 30 seconds

      if (lockAcquired === 'OK') {
        return customerData; // Lock acquired, return the customer data to the agent
      } else {
        // If lock not acquired, return null (or try to get another customer)
        return this.getNextCustomerForAgent(agentId, campaignId); // Recursively get the next customer
      }
    }
    return null;
  }

  /**
   * Pause the agent's status to stop making calls.
   */
  async pauseAgent(agentId: string): Promise<void> {
    await this.redisClient.hset(`agent:${agentId}`, 'status', AgentStatus.PAUSED);
  }


  /**
   * Unlock the customer after the call is completed.
   */
  async unlockCustomer(customerId: string): Promise<void> {
    await this.redisClient.del(`customer_lock:${customerId}`);
  }
}