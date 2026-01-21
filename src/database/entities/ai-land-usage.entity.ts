import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { GridCell } from './grid-cell.entity';
import type { Geometry } from 'geojson';

@Entity('ai_land_usage')
export class AiLandUsage {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'bigint' })
    grid_cell_id: number;

    @Index({ spatial: true })
    @Column({
        type: 'geometry',
        spatialFeatureType: 'Polygon',
        srid: 4326,
        select: false
    })
    geom: Geometry;

    @Column({ type: 'varchar', length: 50, nullable: true })
    land_type: string;

    @Column({ type: 'float', nullable: true })
    area_m2: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => GridCell, (gridCell) => gridCell.landUsages)
    @JoinColumn({ name: 'grid_cell_id' })
    gridCell: GridCell;
}