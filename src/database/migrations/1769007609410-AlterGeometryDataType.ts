import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterGeometryDataType1769007609410 implements MigrationInterface {
    name = 'AlterGeometryDataType1769007609410'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "districts" RENAME COLUMN "geometry" TO "geom"`);
        await queryRunner.query(`CREATE TYPE "public"."feedbacks_category_enum" AS ENUM('WRONG_DETECTION', 'MISSING_OBJECT', 'WRONG_CLASSIFICATION', 'OTHER')`);
        await queryRunner.query(`CREATE TYPE "public"."feedbacks_status_enum" AS ENUM('PENDING', 'RESOLVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "feedbacks" ("id" SERIAL NOT NULL, "grid_cell_id" bigint, "full_name" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "category" "public"."feedbacks_category_enum" NOT NULL, "lat" double precision, "lng" double precision, "message" text NOT NULL, "status" "public"."feedbacks_status_enum" NOT NULL DEFAULT 'PENDING', "admin_note" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_79affc530fdd838a9f1e0cc30be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "districts" ALTER COLUMN "geom" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_741f26b6f4836828b58c3e5f6b" ON "ai_buildings" USING GiST ("geom") `);
        await queryRunner.query(`CREATE INDEX "IDX_a8c799c2dca0b0f047e3796f98" ON "ai_land_usage" USING GiST ("geom") `);
        await queryRunner.query(`CREATE INDEX "IDX_71910b1241e5474c88cd72108d" ON "grid_cells" USING GiST ("geom") `);
        await queryRunner.query(`CREATE INDEX "IDX_ff411e3b9d9305cdbffff14b6f" ON "districts" USING GiST ("geom") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_ff411e3b9d9305cdbffff14b6f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_71910b1241e5474c88cd72108d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a8c799c2dca0b0f047e3796f98"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_741f26b6f4836828b58c3e5f6b"`);
        await queryRunner.query(`ALTER TABLE "districts" ALTER COLUMN "geom" DROP NOT NULL`);
        await queryRunner.query(`DROP TABLE "feedbacks"`);
        await queryRunner.query(`DROP TYPE "public"."feedbacks_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."feedbacks_category_enum"`);
        await queryRunner.query(`ALTER TABLE "districts" RENAME COLUMN "geom" TO "geometry"`);
    }

}
