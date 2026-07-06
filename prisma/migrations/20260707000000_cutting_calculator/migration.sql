-- AlterTable: updatedAt ведёт Prisma-клиент (@updatedAt), DB-дефолт больше не нужен
ALTER TABLE "Category" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable: позиции калькулятора резки в заявке ([] — обычная заявка)
ALTER TABLE "Lead" ADD COLUMN     "calcItems" JSONB NOT NULL DEFAULT '[]';

-- AlterTable: настройки калькулятора резки
ALTER TABLE "SiteSettings" ADD COLUMN     "metalPricePerTon" DOUBLE PRECISION NOT NULL DEFAULT 120000,
ADD COLUMN     "scrapPricePerKg" DOUBLE PRECISION NOT NULL DEFAULT 12;

-- CreateTable: прайс плазменной резки
CREATE TABLE "CuttingPriceRow" (
    "id" TEXT NOT NULL,
    "thickness" DOUBLE PRECISION NOT NULL,
    "pricePerMeter" DOUBLE PRECISION NOT NULL,
    "piercePrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CuttingPriceRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CuttingPriceRow_thickness_key" ON "CuttingPriceRow"("thickness");

-- Seed: стартовый прайс со старого сайта (наценка ×1.2 уже применена, дальше правится в админке)
INSERT INTO "CuttingPriceRow" (id, thickness, "pricePerMeter", "piercePrice") VALUES
  ('cut-2',  2,  34,  8),
  ('cut-3',  3,  47,  12),
  ('cut-6',  6,  82,  20),
  ('cut-8',  8,  98,  24),
  ('cut-10', 10, 108, 26),
  ('cut-12', 12, 128, 30),
  ('cut-14', 14, 136, 32),
  ('cut-16', 16, 149, 36),
  ('cut-18', 18, 156, 37),
  ('cut-20', 20, 204, 48),
  ('cut-22', 22, 230, 53),
  ('cut-25', 25, 271, 63),
  ('cut-30', 30, 312, 72),
  ('cut-32', 32, 366, 85),
  ('cut-35', 35, 448, 103),
  ('cut-40', 40, 542, 125),
  ('cut-45', 45, 650, 150),
  ('cut-50', 50, 773, 178)
ON CONFLICT (thickness) DO NOTHING;
