-- Сохраняем фактический текущий порядок четырёх настраиваемых блоков страницы категории.
ALTER TABLE "Category"
ADD COLUMN "pageBlocksOrder" TEXT[] NOT NULL DEFAULT ARRAY['aboutUs', 'completedProjects', 'requestForm', 'contacts']::TEXT[];
