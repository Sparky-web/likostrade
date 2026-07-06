-- CreateEnum
CREATE TYPE "CategoryHeaderMode" AS ENUM ('HERO', 'COMPACT');

-- CreateEnum
CREATE TYPE "CategoryChildrenMode" AS ENUM ('TILES', 'SIDEBAR', 'CARDS');

-- AlterTable: новые поля; updatedAt с DB-дефолтом, потому что таблица непустая (дальше значение ведёт Prisma-клиент через @updatedAt)
ALTER TABLE "Category"
ADD COLUMN     "catalogTitle" TEXT,
ADD COLUMN     "childrenMode" "CategoryChildrenMode" NOT NULL DEFAULT 'TILES',
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "headerMode" "CategoryHeaderMode" NOT NULL DEFAULT 'HERO',
ADD COLUMN     "sections" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DataMigration: непустой htmlDescription становится единственной текстовой секцией (схема — src/sections/schema.ts)
UPDATE "Category"
SET "sections" = jsonb_build_array(
  jsonb_build_object(
    'id', gen_random_uuid()::text,
    'type', 'text',
    'html', "htmlDescription"
  )
)
WHERE "htmlDescription" IS NOT NULL AND btrim("htmlDescription") <> '';

-- DropColumn: единственный источник контента страницы — sections
ALTER TABLE "Category" DROP COLUMN "htmlDescription";
