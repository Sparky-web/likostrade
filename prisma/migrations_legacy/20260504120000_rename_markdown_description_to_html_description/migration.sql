-- Переименование колонки описания с исторического имени из @map Prisma на htmlDescription.
-- На новых базах колонка уже может называться htmlDescription — тогда шаг пропускается.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_attribute a
    JOIN pg_class t ON a.attrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND t.relname = 'Category'
      AND a.attname = 'markdownDescription'
      AND NOT a.attisdropped
  )
  AND NOT EXISTS (
    SELECT 1
    FROM pg_attribute a
    JOIN pg_class t ON a.attrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND t.relname = 'Category'
      AND a.attname = 'htmlDescription'
      AND NOT a.attisdropped
  ) THEN
    EXECUTE 'ALTER TABLE "Category" RENAME COLUMN "markdownDescription" TO "htmlDescription"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_attribute a
    JOIN pg_class t ON a.attrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND t.relname = 'Project'
      AND a.attname = 'markdownDescription'
      AND NOT a.attisdropped
  )
  AND NOT EXISTS (
    SELECT 1
    FROM pg_attribute a
    JOIN pg_class t ON a.attrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND t.relname = 'Project'
      AND a.attname = 'htmlDescription'
      AND NOT a.attisdropped
  ) THEN
    EXECUTE 'ALTER TABLE "Project" RENAME COLUMN "markdownDescription" TO "htmlDescription"';
  END IF;
END $$;
