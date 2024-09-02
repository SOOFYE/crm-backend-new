import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class JobService {
  constructor(@InjectQueue('default') private readonly jobQueue: Queue) {}

  async queueJob(job: { type: string; data: any }) {
    await this.jobQueue.add(job.type, job.data);
  }
}
