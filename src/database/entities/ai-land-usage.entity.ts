import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GridCell } from './grid-cell.entity';
@Entity('ai_land_usage')
export class AiLandUsage {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;
    @Column({ type: 'bigint' })
    grid_cell_id: number;
    @Column({ type: 'geometry', spatialFeatureType: 'Polygon', srid: 4326 })
    geom: string;
    @Column({ type: 'varchar', length: 50, nullable: true })
    land_type: string;
    @Column({ type: 'float', nullable: true })
    area_m2: number;
    @ManyToOne(() => GridCell, (gridCell) => gridCell.landUsages)
    @JoinColumn({ name: 'grid_cell_id' })
    gridCell: GridCell;
}