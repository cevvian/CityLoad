import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1769132695309 implements MigrationInterface {
    name = 'Init1769132695309'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_grid_cells_district"`);
        await queryRunner.query(`DROP INDEX "public"."idx_grid_cells_geom"`);
        await queryRunner.query(`DROP INDEX "public"."idx_districts_geometry"`);
        await queryRunner.query(`CREATE TABLE "ai_buildings" ("id" SERIAL NOT NULL, "grid_cell_id" integer NOT NULL, "geom" geometry(Polygon,4326) NOT NULL, "confidence_score" double precision, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_59d94e7b53b7716ae9640ee0b31" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_741f26b6f4836828b58c3e5f6b" ON "ai_buildings" USING GiST ("geom") `);
        await queryRunner.query(`CREATE TABLE "ai_land_usage" ("id" SERIAL NOT NULL, "grid_cell_id" integer NOT NULL, "geom" geometry(Polygon,4326) NOT NULL, "land_type" character varying(50), "area_m2" double precision, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7a913f73c569055861d420174bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a8c799c2dca0b0f047e3796f98" ON "ai_land_usage" USING GiST ("geom") `);
        await queryRunner.query(`CREATE TABLE "feedbacks" ("id" SERIAL NOT NULL, "grid_cell_id" integer, "full_name" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "category" "public"."feedbacks_category_enum" NOT NULL, "lat" double precision, "lng" double precision, "message" text NOT NULL, "status" "public"."feedbacks_status_enum" NOT NULL DEFAULT 'PENDING', "admin_note" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_79affc530fdd838a9f1e0cc30be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "grid_cells" DROP CONSTRAINT "grid_cells_pkey"`);
        await queryRunner.query(`ALTER TABLE "grid_cells" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ADD CONSTRAINT "PK_d0fcaee4d702c7696fd79cd43d4" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "grid_code" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "total_area_m2" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "total_area_m2" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "building_area_m2" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "urban_land_area_m2" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "density_ratio" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ADD "status" "public"."grid_cells_status_enum" NOT NULL DEFAULT 'PENDING'`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "last_updated" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "last_updated" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "districts" ALTER COLUMN "name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "districts" ALTER COLUMN "geometry" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_71910b1241e5474c88cd72108d" ON "grid_cells" USING GiST ("geom") `);
        await queryRunner.query(`CREATE INDEX "IDX_c7ba2abc32807cd5671090a369" ON "districts" USING GiST ("geometry") `);
        await queryRunner.query(`ALTER TABLE "ai_buildings" ADD CONSTRAINT "FK_ab6d6e2057fd9dc0d08d4fb2363" FOREIGN KEY ("grid_cell_id") REFERENCES "grid_cells"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ai_land_usage" ADD CONSTRAINT "FK_d7a7e20a4adce32d323a3212ece" FOREIGN KEY ("grid_cell_id") REFERENCES "grid_cells"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feedbacks" ADD CONSTRAINT "FK_29418694448c467d5bbb9c2e819" FOREIGN KEY ("grid_cell_id") REFERENCES "grid_cells"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feedbacks" DROP CONSTRAINT "FK_29418694448c467d5bbb9c2e819"`);
        await queryRunner.query(`ALTER TABLE "ai_land_usage" DROP CONSTRAINT "FK_d7a7e20a4adce32d323a3212ece"`);
        await queryRunner.query(`ALTER TABLE "ai_buildings" DROP CONSTRAINT "FK_ab6d6e2057fd9dc0d08d4fb2363"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c7ba2abc32807cd5671090a369"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_71910b1241e5474c88cd72108d"`);
        await queryRunner.query(`ALTER TABLE "districts" ALTER COLUMN "geometry" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "districts" ALTER COLUMN "name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "last_updated" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "last_updated" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ADD "status" character varying(20) DEFAULT 'PENDING'`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "density_ratio" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "urban_land_area_m2" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "building_area_m2" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "total_area_m2" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "total_area_m2" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "grid_code" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" DROP CONSTRAINT "PK_d0fcaee4d702c7696fd79cd43d4"`);
        await queryRunner.query(`ALTER TABLE "grid_cells" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ADD "id" BIGSERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ADD CONSTRAINT "grid_cells_pkey" PRIMARY KEY ("id")`);
        await queryRunner.query(`DROP TABLE "feedbacks"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a8c799c2dca0b0f047e3796f98"`);
        await queryRunner.query(`DROP TABLE "ai_land_usage"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_741f26b6f4836828b58c3e5f6b"`);
        await queryRunner.query(`DROP TABLE "ai_buildings"`);
        await queryRunner.query(`CREATE INDEX "idx_districts_geometry" ON "districts" USING GiST ("geometry") `);
        await queryRunner.query(`CREATE INDEX "idx_grid_cells_geom" ON "grid_cells" USING GiST ("geom") `);
        await queryRunner.query(`CREATE INDEX "idx_grid_cells_district" ON "grid_cells" ("district_name") `);
    }

}
