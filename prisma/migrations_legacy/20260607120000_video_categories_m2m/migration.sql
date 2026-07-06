-- M2M Video <-> Category (несколько категорий на видео, как у Project)

CREATE TABLE "_CategoryToVideo" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX "_CategoryToVideo_AB_unique" ON "_CategoryToVideo"("A", "B");
CREATE INDEX "_CategoryToVideo_B_index" ON "_CategoryToVideo"("B");

ALTER TABLE "_CategoryToVideo" ADD CONSTRAINT "_CategoryToVideo_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_CategoryToVideo" ADD CONSTRAINT "_CategoryToVideo_B_fkey" FOREIGN KEY ("B") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "_CategoryToVideo" ("A", "B")
SELECT "categoryId", "id" FROM "Video" WHERE "categoryId" IS NOT NULL;

ALTER TABLE "Video" DROP CONSTRAINT IF EXISTS "Video_categoryId_fkey";
ALTER TABLE "Video" DROP COLUMN "categoryId";
