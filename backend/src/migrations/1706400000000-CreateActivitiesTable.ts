import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateActivitiesTable1706400000000 implements MigrationInterface {
  name = 'CreateActivitiesTable1706400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the activities table with varchar type instead of enum for compatibility
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "activities" (
        "id" SERIAL PRIMARY KEY,
        "type" VARCHAR(50) NOT NULL,
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT NOT NULL,
        "user_id" INTEGER,
        "user_role" VARCHAR(50),
        "metadata" JSONB,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "FK_activities_user" FOREIGN KEY ("user_id") 
          REFERENCES "users"("id") ON DELETE SET NULL
      );
    `);

    // Create index for faster queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_activities_created_at" ON "activities" ("created_at" DESC);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_activities_user_id" ON "activities" ("user_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_activities_type" ON "activities" ("type");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "activities";`);
  }
}
