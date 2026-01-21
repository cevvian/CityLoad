import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { MapsController } from './maps.controller';
import { MapsService } from './maps.service';
import { GridCell } from '../../database/entities/grid-cell.entity';
import { AiBuilding } from '../../database/entities/ai-building.entity';
import { AiLandUsage } from '../../database/entities/ai-land-usage.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GridCell, AiBuilding, AiLandUsage]),
    HttpModule,
  ],
  controllers: [MapsController],
  providers: [MapsService],
  exports: [MapsService],
})
export class MapsModule { }
