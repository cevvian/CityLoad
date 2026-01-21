import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistrictsController } from './districts.controller';
import { DistrictsService } from './districts.service';
import { District } from '../../database/entities/district.entity';
import { GridCell } from '../../database/entities/grid-cell.entity';

@Module({
    imports: [TypeOrmModule.forFeature([District, GridCell])],
    controllers: [DistrictsController],
    providers: [DistrictsService],
    exports: [DistrictsService],
})
export class DistrictsModule { }
