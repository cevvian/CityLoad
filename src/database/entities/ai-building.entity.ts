import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { GridCell } from './grid-cell.entity';
@Entity('ai_buildings')
export class AiBuilding {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;
    @Column({ type: 'bigint' })
    grid_cell_id: number;
    @Column({ type: 'geometry', spatialFeatureType: 'Polygon', srid: 4326 })
    geom: string;
    @Column({ type: 'float', nullable: true })
    confidence_score: number;
    @CreateDateColumn()
    created_at: Date;
    @ManyToOne(() => GridCell, (gridCell) => gridCell.buildings)
    @JoinColumn({ name: 'grid_cell_id' })
    gridCell: GridCell;
}