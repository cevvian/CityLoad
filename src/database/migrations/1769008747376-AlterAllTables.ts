import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterAllTables1769008747376 implements MigrationInterface {
    name = 'AlterAllTables1769008747376'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ai_buildings" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "ai_land_usage" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "ai_land_usage" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "districts" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "districts" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "ai_buildings" DROP CONSTRAINT "FK_ab6d6e2057fd9dc0d08d4fb2363"`);
        await queryRunner.query(`ALTER TABLE "ai_buildings" DROP CONSTRAINT "PK_59d94e7b53b7716ae9640ee0b31"`);
        await queryRunner.query(`ALTER TABLE "ai_buildings" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "ai_buildings" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ai_buildings" ADD CONSTRAINT "PK_59d94e7b53b7716ae9640ee0b31" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "ai_buildings" DROP COLUMN "grid_cell_id"`);
        await queryRunner.query(`ALTER TABLE "ai_buildings" ADD "grid_cell_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ai_land_usage" DROP CONSTRAINT "FK_d7a7e20a4adce32d323a3212ece"`);
        await queryRunner.query(`ALTER TABLE "ai_land_usage" DROP CONSTRAINT "PK_7a913f73c569055861d420174bc"`);
        await queryRunner.query(`ALTER TABLE "ai_land_usage" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "ai_land_usage" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ai_land_usage" ADD CONSTRAINT "PK_7a913f73c569055861d420174bc" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "ai_land_usage" DROP COLUMN "grid_cell_id"`);
        await queryRunner.query(`ALTER TABLE "ai_land_usage" ADD "grid_cell_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" DROP CONSTRAINT "grid_cells_pkey"`);
        await queryRunner.query(`ALTER TABLE "grid_cells" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ADD CONSTRAINT "PK_d0fcaee4d702c7696fd79cd43d4" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "grid_code" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ADD CONSTRAINT "UQ_1649d76b7d8c0ffe3122b53eded" UNIQUE ("grid_code")`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "total_area_m2" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "total_area_m2" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "building_area_m2" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "building_area_m2" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "urban_land_area_m2" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "urban_land_area_m2" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "density_ratio" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "density_ratio" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "grid_cells" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."grid_cells_status_enum" AS ENUM('PENDING', 'PROCESSING', 'PROCESSED', 'ERROR')`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ADD "status" "public"."grid_cells_status_enum" NOT NULL DEFAULT 'PENDING'`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "last_updated" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "last_updated" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "districts" ALTER COLUMN "name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "feedbacks" DROP COLUMN "grid_cell_id"`);
        await queryRunner.query(`ALTER TABLE "feedbacks" ADD "grid_cell_id" integer`);
        await queryRunner.query(`ALTER TABLE "ai_buildings" ADD CONSTRAINT "FK_ab6d6e2057fd9dc0d08d4fb2363" FOREIGN KEY ("grid_cell_id") REFERENCES "grid_cells"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ai_land_usage" ADD CONSTRAINT "FK_d7a7e20a4adce32d323a3212ece" FOREIGN KEY ("grid_cell_id") REFERENCES "grid_cells"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feedbacks" ADD CONSTRAINT "FK_29418694448c467d5bbb9c2e819" FOREIGN KEY ("grid_cell_id") REFERENCES "grid_cells"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feedbacks" DROP CONSTRAINT "FK_29418694448c467d5bbb9c2e819"`);
        await queryRunner.query(`ALTER TABLE "ai_land_usage" DROP CONSTRAINT "FK_d7a7e20a4adce32d323a3212ece"`);
        await queryRunner.query(`ALTER TABLE "ai_buildings" DROP CONSTRAINT "FK_ab6d6e2057fd9dc0d08d4fb2363"`);
        await queryRunner.query(`ALTER TABLE "feedbacks" DROP COLUMN "grid_cell_id"`);
        await queryRunner.query(`ALTER TABLE "feedbacks" ADD "grid_cell_id" bigint`);
        await queryRunner.query(`ALTER TABLE "districts" ALTER COLUMN "name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "last_updated" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "last_updated" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."grid_cells_status_enum"`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ADD "status" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "density_ratio" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "density_ratio" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "urban_land_area_m2" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "urban_land_area_m2" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "building_area_m2" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "building_area_m2" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "total_area_m2" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "total_area_m2" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" DROP CONSTRAINT "UQ_1649d76b7d8c0ffe3122b53eded"`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ALTER COLUMN "grid_code" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" DROP CONSTRAINT "PK_d0fcaee4d702c7696fd79cd43d4"`);
        await queryRunner.query(`ALTER TABLE "grid_cells" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ADD "id" BIGSERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "grid_cells" ADD CONSTRAINT "grid_cells_pkey" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "ai_land_usage" DROP COLUMN "grid_cell_id"`);
        await queryRunner.query(`ALTER TABLE "ai_land_usage" ADD "grid_cell_id" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ai_land_usage" DROP CONSTRAINT "PK_7a913f73c569055861d420174bc"`);
        await queryRunner.query(`ALTER TABLE "ai_land_usage" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "ai_land_usage" ADD "id" BIGSERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ai_land_usage" ADD CONSTRAINT "PK_7a913f73c569055861d420174bc" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "ai_land_usage" ADD CONSTRAINT "FK_d7a7e20a4adce32d323a3212ece" FOREIGN KEY ("grid_cell_id") REFERENCES "grid_cells"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ai_buildings" DROP COLUMN "grid_cell_id"`);
        await queryRunner.query(`ALTER TABLE "ai_buildings" ADD "grid_cell_id" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ai_buildings" DROP CONSTRAINT "PK_59d94e7b53b7716ae9640ee0b31"`);
        await queryRunner.query(`ALTER TABLE "ai_buildings" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "ai_buildings" ADD "id" BIGSERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ai_buildings" ADD CONSTRAINT "PK_59d94e7b53b7716ae9640ee0b31" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "ai_buildings" ADD CONSTRAINT "FK_ab6d6e2057fd9dc0d08d4fb2363" FOREIGN KEY ("grid_cell_id") REFERENCES "grid_cells"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "districts" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "districts" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "ai_land_usage" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "ai_land_usage" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "ai_buildings" DROP COLUMN "updated_at"`);
    }

}
