-- AlterTable
ALTER TABLE "Category"
ADD COLUMN "inheritProjectsFromParent" BOOLEAN NOT NULL DEFAULT false;
