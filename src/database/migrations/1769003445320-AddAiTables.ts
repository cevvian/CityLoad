import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAiTables1769003445320 implements MigrationInterface {
    name = 'AddAiTables1769003445320'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_grid_cells_district"`);
        await queryRunner.query(`DROP INDEX "public"."idx_grid_cells_geom"`);
        await queryRunner.query(`DROP INDEX "public"."idx_districts_geometry"`);
        await queryRunner.query(`CREATE TABLE "ai_buildings" ("id" BIGSERIAL NOT NULL, "grid_cell_id" bigint NOT NULL, "geom" geometry(Polygon,4326) NOT NULL, "confidence_score" double precision, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_59d94e7b53b7716ae9640ee0b31" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ai_land_usage" ("id" BIGSERIAL NOT NULL, "grid_cell_id" bigint NOT NULL, "geom" geometry(Polygon,4326) NOT NULL, "land_type" character varying(50), "area_m2" double precision, CONSTRAINT "PK_7a913f73c569055861d420174bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "districts" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "districts" ADD CONSTRAINT "PK_972a72ff4e3bea5c7f43a2b98af" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "grid_cells" DROP CONSTRAINT "grid_cells_grid_code_key"`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "building_area_m2" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "urban_land_area_m2" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "density_ratio" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "last_updated" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "ai_buildings" ADD CONSTRAINT "FK_ab6d6e2057fd9dc0d08d4fb2363" FOREIGN KEY ("grid_cell_id") REFERENCES "grid_cells"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ai_land_usage" ADD CONSTRAINT "FK_d7a7e20a4adce32d323a3212ece" FOREIGN KEY ("grid_cell_id") REFERENCES "grid_cells"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ai_land_usage" DROP CONSTRAINT "FK_d7a7e20a4adce32d323a3212ece"`);
        await queryRunner.query(`ALTER TABLE "ai_buildings" DROP CONSTRAINT "FK_ab6d6e2057fd9dc0d08d4fb2363"`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "last_updated" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "density_ratio" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "urban_land_area_m2" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "building_area_m2" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ADD CONSTRAINT "grid_cells_grid_code_key" UNIQUE ("grid_code")`);
        await queryRunner.query(`ALTER TABLE "districts" DROP CONSTRAINT "PK_972a72ff4e3bea5c7f43a2b98af"`);
        await queryRunner.query(`ALTER TABLE "districts" DROP COLUMN "id"`);
        await queryRunner.query(`DROP TABLE "ai_land_usage"`);
        await queryRunner.query(`DROP TABLE "ai_buildings"`);
        await queryRunner.query(`CREATE INDEX "idx_districts_geometry" ON "districts" USING GiST ("geometry") `);
        await queryRunner.query(`CREATE INDEX "idx_grid_cells_geom" ON "grid_cells" USING GiST ("geom") `);
        await queryRunner.query(`CREATE INDEX "idx_grid_cells_district" ON "grid_cells" ("district_name") `);
    }

}
