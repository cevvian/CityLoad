import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexesToGridCells1769133000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add index on status column for filtering queries
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_grid_status ON grid_cells(status)`);

        // Add index on district_name for district-based queries
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_grid_district ON grid_cells(district_name)`);

        // Add index on ward_name for ward-based queries
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_grid_ward ON grid_cells(ward_name)`);

        // Add composite index for common query pattern (district + status)
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_grid_district_status ON grid_cells(district_name, status)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove indexes in reverse order
        await queryRunner.query(`DROP INDEX IF EXISTS idx_grid_district_status`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_grid_ward`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_grid_district`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_grid_status`);
    }

}
