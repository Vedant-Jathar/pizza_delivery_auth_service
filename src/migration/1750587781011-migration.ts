import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1750587781011 implements MigrationInterface {
  name = 'Migration1750587781011'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_f1a5e69b57446c371007423cab1"`,
    )
    await queryRunner.query(
      `ALTER TABLE "refresh_token" RENAME COLUMN "createdAtId" TO "userId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_8e913e288156c133999341156ad" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_8e913e288156c133999341156ad"`,
    )
    await queryRunner.query(
      `ALTER TABLE "refresh_token" RENAME COLUMN "userId" TO "createdAtId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_f1a5e69b57446c371007423cab1" FOREIGN KEY ("createdAtId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }
}
