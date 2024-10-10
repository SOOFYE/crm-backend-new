import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as XLSX from 'xlsx';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { Parser } from 'json2csv';
import * as path from 'path';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name); // Initialize a logger
  private s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

  async uploadFile(folder:string,file: Express.Multer.File): Promise<{s3Url:string,baseName:string,ext:string}> {
        let baseName = file.originalname;
        const ext =  path.extname(file.originalname)
        baseName = baseName.replace(/[^\w\-]/g, '_')
        const subKey = `${baseName}`
    try {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${folder}/${subKey}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      const data = await this.s3.upload(params).promise();
      this.logger.log(`File uploaded successfully: ${data.Location}`);
      return {s3Url: data.Location,baseName: subKey, ext:ext}; // Return the URL of the uploaded file
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw new Error('File upload failed');
    }
  }

  async downloadAndParseFile(s3Url: string): Promise<any[]> {
    try {
      // Extract the S3 key from the URL
      const key = s3Url.split(`s3.${process.env.AWS_REGION}.amazonaws.com/`)[1];
      console.log(key)
      if (!key) {
        this.logger.error('S3 Key extraction failed.');
        throw new Error('S3 Key extraction failed.');
      }

      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key, // Use the extracted key
      };
      const data = await this.s3.getObject(params).promise();

      // Ensure the Body is treated as a Buffer
      const fileBuffer = data.Body as Buffer;

      const fileExtension = s3Url.split('.').pop();

      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        return this.parseExcelFile(fileBuffer);
      } else if (fileExtension === 'csv') {
        return this.parseCsvFile(fileBuffer);
      } else {
        this.logger.error(`Unsupported file type: ${fileExtension}`);
        throw new Error('Unsupported file type');
      }
    } catch (error) {
      this.logger.error(`Failed to download or parse file: ${error.message}`);
      throw new Error('File download or parsing failed');
    }
  }

  private parseExcelFile(buffer: Buffer): any[] {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      this.logger.log('Excel file parsed successfully');
      return jsonData;
    } catch (error) {
      this.logger.error(`Failed to parse Excel file: ${error.message}`);
      throw new Error('Excel file parsing failed');
    }
  }

  private parseCsvFile(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const jsonData: any[] = [];
      const stream = Readable.from(buffer);

      stream
        .pipe(csv())
        .on('data', (row) => jsonData.push(row))
        .on('end', () => {
          this.logger.log('CSV file parsed successfully');
          resolve(jsonData);
        })
        .on('error', (err) => {
          this.logger.error(`Failed to parse CSV file: ${err.message}`);
          reject(new Error('CSV file parsing failed'));
        });
    });
  }

  async deleteFile(s3Url: string): Promise<void> {
    try {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: s3Url.split('.com/')[1],
      };
      await this.s3.deleteObject(params).promise();
      this.logger.log(`File deleted successfully: ${s3Url}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw new Error('File deletion failed');
    }
  }

  async uploadProcessedData(folder:string,fileName:string,data: any[]): Promise<string> {
    try {
      const json2csvParser = new Parser();
      const csvData = json2csvParser.parse(data);
      const buffer = Buffer.from(csvData);
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${folder}/${fileName}`,
        Body: buffer,
        ContentType: 'text/csv',
      };
      const uploadData = await this.s3.upload(params).promise();
      this.logger.log(`Processed data uploaded successfully: ${uploadData.Location}`);
      return uploadData.Location; // Return the URL of the uploaded processed file
    } catch (error) {
      this.logger.error(`Failed to upload processed data: ${error.message}`);
      throw new Error('Processed data upload failed');
    }
  }


  async uploadStatsData(folder: string, fileName: string, csvData: string): Promise<string> {
    const s3Key = `${folder}/${fileName}`;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: csvData,
      ContentType: 'text/csv',
      Expires: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) // Expires in 3 weeks
    };
    
    const result = await this.s3.upload(params).promise();
    return result.Location; // Return the S3 URL of the uploaded file
  }

  async generateSignedUrl(s3Url: string): Promise<string> {
    try {
      const key = s3Url.split('.com/')[1];

      if (!key) {
        this.logger.error('S3 Key extraction failed.');
        throw new HttpException('Invalid S3 URL provided.', HttpStatus.BAD_REQUEST);
      }

      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Expires: 60 * 5, // URL expiration time in seconds (e.g., 5 minutes)
      };

      const signedUrl = this.s3.getSignedUrl('getObject', params);
      this.logger.log(`Signed URL generated successfully: ${signedUrl}`);
      return signedUrl;
    } catch (error) {
      this.logger.error(`Failed to generate signed URL: ${error.message}`);

      // If the error is already an instance of HttpException, rethrow it
      if (error instanceof HttpException) {
        throw error;
      }

      // Otherwise, throw an Internal Server Error
      throw new HttpException('Failed to generate signed URL.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async generateSignedUrlWithTime(url: string, expiresInSeconds: number): Promise<string> {
    const key = this.extractKeyFromUrl(url);
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Expires: expiresInSeconds,
    };
    return this.s3.getSignedUrlPromise('getObject', params);
}

/**
 * Extracts the S3 object key from a full S3 URL.
 * @param {string} url - The full S3 URL.
 * @returns {string} - The extracted key.
 */
private extractKeyFromUrl(url: string): string {
    const urlObj = new URL(url);
    return decodeURIComponent(urlObj.pathname.substring(1)); // Remove leading '/'
}
  
}
