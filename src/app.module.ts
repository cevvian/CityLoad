import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { MapsModule } from './modules/maps/maps.module';
import { SearchModule } from './modules/search/search.module';
import { DetectionModule } from './modules/detection/detection.module';
import { FeedbackModule } from './modules/feedback/feedback.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig()),
    MapsModule,
    SearchModule,
    DetectionModule,
    FeedbackModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
