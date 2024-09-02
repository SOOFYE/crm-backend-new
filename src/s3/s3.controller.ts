import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import { S3Service } from './s3.service';

@Controller('s3')
@ApiTags('S3') // This will group the endpoints under "S3" in Swagger UI
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}


  @Post('generate-signed-url')
  @ApiOperation({ summary: 'Generate a signed URL for an S3 object' })
  @ApiBody({
    description: 'The S3 URL for which a signed URL needs to be generated',
    schema: {
      type: 'object',
      properties: {
        s3Url: {
          type: 'string',
          example: 'https://your-bucket-name.s3.amazonaws.com/path/to/file',
        },
      },
      required: ['s3Url'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully generated signed URL',
    schema: {
      type: 'object',
      properties: {
        signedUrl: {
          type: 'string',
          example: 'https://your-bucket-name.s3.amazonaws.com/path/to/file?AWSAccessKeyId=...',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid S3 URL provided',
  })
  async getSignedUrl(@Body('s3Url') s3Url: string): Promise<{ signedUrl: string }> {
    const signedUrl = await this.s3Service.generateSignedUrl(s3Url);
    return { signedUrl };
  }


  // Other existing endpoints...
}