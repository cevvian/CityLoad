import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { GridCell } from '../../database/entities/grid-cell.entity';
import { District } from '../../database/entities/district.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GridCell, District]),
    HttpModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule { }
