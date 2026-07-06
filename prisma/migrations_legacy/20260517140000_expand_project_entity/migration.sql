-- Расширение сущности Project: M2M категории, главное/доп. фото, richtext-поля, isHidden

ALTER TABLE "Project" ADD COLUMN "task" TEXT;
ALTER TABLE "Project" ADD COLUMN "workProgress" TEXT;
ALTER TABLE "Project" ADD COLUMN "result" TEXT;
ALTER TABLE "Project" ADD COLUMN "isHidden" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Project" ADD COLUMN "mainImageId" TEXT;

UPDATE "Project" SET "result" = "htmlDescription" WHERE "htmlDescription" IS NOT NULL;

ALTER TABLE "Project" DROP COLUMN "htmlDescription";

ALTER TABLE "Project" ALTER COLUMN "price" TYPE TEXT USING (
  CASE WHEN "price" IS NULL THEN NULL ELSE "price"::text END
);

UPDATE "Project" SET "dateCompleted" = '1900-01-01' WHERE "dateCompleted" IS NULL OR trim("dateCompleted") = '';
ALTER TABLE "Project" ALTER COLUMN "dateCompleted" SET NOT NULL;

-- M2M Project <-> Category
CREATE TABLE "_CategoryToProject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX "_CategoryToProject_AB_unique" ON "_CategoryToProject"("A", "B");
CREATE INDEX "_CategoryToProject_B_index" ON "_CategoryToProject"("B");

ALTER TABLE "_CategoryToProject" ADD CONSTRAINT "_CategoryToProject_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_CategoryToProject" ADD CONSTRAINT "_CategoryToProject_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "_CategoryToProject" ("A", "B")
SELECT "categoryId", "id" FROM "Project" WHERE "categoryId" IS NOT NULL;

ALTER TABLE "Project" DROP CONSTRAINT IF EXISTS "Project_categoryId_fkey";
ALTER TABLE "Project" DROP COLUMN "categoryId";

-- Главное фото: первый файл из прежней M2M-связи
UPDATE "Project" p
SET "mainImageId" = sub."fileId"
FROM (
  SELECT DISTINCT ON (ft."B") ft."B" AS "projectId", ft."A" AS "fileId"
  FROM "_FileToProject" ft
  ORDER BY ft."B", ft."A"
) sub
WHERE p.id = sub."projectId";

ALTER TABLE "Project" ADD CONSTRAINT "Project_mainImageId_fkey" FOREIGN KEY ("mainImageId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Доп. фото: оставшиеся связи (без главного)
DELETE FROM "_FileToProject" ft
USING "Project" p
WHERE ft."B" = p.id AND ft."A" = p."mainImageId";

ALTER TABLE "_FileToProject" RENAME TO "_ProjectAdditionalImages";
