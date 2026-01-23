import type { Geometry } from 'geojson';
import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('districts')
export class District {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'text' })
    name: string;

    @Index({ spatial: true })
    @Column({
        type: 'geometry',
        spatialFeatureType: 'Polygon',
        srid: 4326,
        select: false
    })
    geometry: Geometry;
}