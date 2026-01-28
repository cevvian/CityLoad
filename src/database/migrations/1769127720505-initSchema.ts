import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1769127720505 implements MigrationInterface {
    name = 'InitSchema1769127720505'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ai_buildings" ("id" SERIAL NOT NULL, "grid_cell_id" integer NOT NULL, "geom" geometry(Polygon,4326) NOT NULL, "confidence_score" double precision, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_59d94e7b53b7716ae9640ee0b31" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_741f26b6f4836828b58c3e5f6b" ON "ai_buildings" USING GiST ("geom") `);
        await queryRunner.query(`CREATE TABLE "ai_land_usage" ("id" SERIAL NOT NULL, "grid_cell_id" integer NOT NULL, "geom" geometry(Polygon,4326) NOT NULL, "land_type" character varying(50), "area_m2" double precision, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7a913f73c569055861d420174bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a8c799c2dca0b0f047e3796f98" ON "ai_land_usage" USING GiST ("geom") `);
        await queryRunner.query(`CREATE TYPE "public"."grid_cells_status_enum" AS ENUM('PENDING', 'PROCESSING', 'PROCESSED', 'ERROR')`);
        await queryRunner.query(`CREATE TABLE "grid_cells" ("id" SERIAL NOT NULL, "grid_code" character varying(50) NOT NULL, "district_name" character varying(100), "ward_name" character varying(100), "geom" geometry(Polygon,4326) NOT NULL, "total_area_m2" double precision NOT NULL DEFAULT '0', "building_area_m2" double precision NOT NULL DEFAULT '0', "urban_land_area_m2" double precision NOT NULL DEFAULT '0', "density_ratio" double precision NOT NULL DEFAULT '0', "status" "public"."grid_cells_status_enum" NOT NULL DEFAULT 'PENDING', "last_updated" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1649d76b7d8c0ffe3122b53eded" UNIQUE ("grid_code"), CONSTRAINT "PK_d0fcaee4d702c7696fd79cd43d4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_71910b1241e5474c88cd72108d" ON "grid_cells" USING GiST ("geom") `);
        await queryRunner.query(`CREATE TABLE "districts" ("id" SERIAL NOT NULL, "name" text NOT NULL, "geom" geometry(Polygon,4326) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_972a72ff4e3bea5c7f43a2b98af" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ff411e3b9d9305cdbffff14b6f" ON "districts" USING GiST ("geom") `);
        await queryRunner.query(`CREATE TYPE "public"."feedbacks_category_enum" AS ENUM('WRONG_DETECTION', 'MISSING_OBJECT', 'WRONG_CLASSIFICATION', 'OTHER')`);
        await queryRunner.query(`CREATE TYPE "public"."feedbacks_status_enum" AS ENUM('PENDING', 'RESOLVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "feedbacks" ("id" SERIAL NOT NULL, "grid_cell_id" integer, "full_name" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "category" "public"."feedbacks_category_enum" NOT NULL, "lat" double precision, "lng" double precision, "message" text NOT NULL, "status" "public"."feedbacks_status_enum" NOT NULL DEFAULT 'PENDING', "admin_note" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_79affc530fdd838a9f1e0cc30be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "ai_buildings" ADD CONSTRAINT "FK_ab6d6e2057fd9dc0d08d4fb2363" FOREIGN KEY ("grid_cell_id") REFERENCES "grid_cells"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ai_land_usage" ADD CONSTRAINT "FK_d7a7e20a4adce32d323a3212ece" FOREIGN KEY ("grid_cell_id") REFERENCES "grid_cells"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feedbacks" ADD CONSTRAINT "FK_29418694448c467d5bbb9c2e819" FOREIGN KEY ("grid_cell_id") REFERENCES "grid_cells"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feedbacks" DROP CONSTRAINT "FK_29418694448c467d5bbb9c2e819"`);
        await queryRunner.query(`ALTER TABLE "ai_land_usage" DROP CONSTRAINT "FK_d7a7e20a4adce32d323a3212ece"`);
        await queryRunner.query(`ALTER TABLE "ai_buildings" DROP CONSTRAINT "FK_ab6d6e2057fd9dc0d08d4fb2363"`);
        await queryRunner.query(`DROP TABLE "feedbacks"`);
        await queryRunner.query(`DROP TYPE "public"."feedbacks_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."feedbacks_category_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ff411e3b9d9305cdbffff14b6f"`);
        await queryRunner.query(`DROP TABLE "districts"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_71910b1241e5474c88cd72108d"`);
        await queryRunner.query(`DROP TABLE "grid_cells"`);
        await queryRunner.query(`DROP TYPE "public"."grid_cells_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a8c799c2dca0b0f047e3796f98"`);
        await queryRunner.query(`DROP TABLE "ai_land_usage"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_741f26b6f4836828b58c3e5f6b"`);
        await queryRunner.query(`DROP TABLE "ai_buildings"`);
    }

}
