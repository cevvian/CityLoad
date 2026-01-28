import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistrictsController } from './districts.controller';
import { DistrictsService } from './districts.service';
import { District } from '../../database/entities/district.entity';
import { GridCell } from '../../database/entities/grid-cell.entity';
import { AiBuilding } from '../../database/entities/ai-building.entity';
import { AiLandUsage } from '../../database/entities/ai-land-usage.entity';

@Module({
    imports: [TypeOrmModule.forFeature([District, GridCell, AiBuilding, AiLandUsage])],
    controllers: [DistrictsController],
    providers: [DistrictsService],
    exports: [DistrictsService],
})
export class DistrictsModule { }
