import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeederService } from './database/seeder.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const seederService = app.get(SeederService);
    
    try {
        console.log('Seeding database...');
        await seederService.seed();
        console.log('Seeding complete!');
    } catch (error) {
        console.error('Seeding failed!', error);
    } finally {
        await app.close();
    }
}

bootstrap();
