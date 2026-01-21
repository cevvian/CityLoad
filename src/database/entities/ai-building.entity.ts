import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { GridCell } from './grid-cell.entity';
import type { Geometry } from 'geojson';

@Entity('ai_buildings')
export class AiBuilding {
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

    @Column({ type: 'float', nullable: true })
    confidence_score: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => GridCell, (gridCell) => gridCell.buildings)
    @JoinColumn({ name: 'grid_cell_id' })
    gridCell: GridCell;
}