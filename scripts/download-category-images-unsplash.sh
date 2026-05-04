#!/usr/bin/env bash
# Скачивает реальные фото с Unsplash (https://unsplash.com/license) для категорий Ликос.
# Имена файлов совпадают с imageFileId в prisma/data/categories/*.json
#
# Запуск из корня репозитория:
#   bash scripts/download-category-images-unsplash.sh

set -euo pipefail

UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) LikosCategoryImages/1.0"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/prisma/data/categories/images"

mkdir -p "$OUT"

# Аргументы: локальное_имя.jpg unsplash_id (без префикса photo-)
fetch() {
  local name="$1" id="$2"
  local url="https://images.unsplash.com/photo-${id}?w=1400&q=82&fm=jpg"
  echo "→ $name"
  curl -fsSL -A "$UA" -o "$OUT/$name" "$url"
}

# --- Корень и металлоконструкции (включая обсадные фильтры как поддерево)
fetch likos-cat-metallokonstruktsii.jpg "1503387762-592deb58ef4e"
fetch likos-sub-karkasy.jpg "1541888946425-d81bb19240f5"
fetch likos-sub-bystrovozvodimye.jpg "1742278970780-5183fa6329fd"
fetch likos-sub-spetsialnye.jpg "1513828583688-c52646db42da"
fetch likos-sub-svarnye-balki.jpg "1489515217757-5fd1be406fef"
fetch likos-sub-ograzhdeniya.jpg "1558618666-fcd25c85cd64"
fetch likos-sub-protivopodkop.jpg "1636368085784-ceb7909dba73"
fetch likos-sub-poroshkovaya.jpg "1544986581-efac024faf62"
fetch likos-sub-opory.jpg "1586528116311-ad8dd3c8310d"
fetch likos-sub-obsadnye-grupa.jpg "1621905251918-48416bd8575a"
fetch likos-sub-filter-setchatye.jpg "1578662996442-48f60103fc96"
fetch likos-sub-filter-shchelevye.jpg "1587293852726-70cdb56c2866"
fetch likos-sub-filter-provolochnye.jpg "1544986581-efac024faf62"
fetch likos-sub-gidromonitoring.jpg "1473341304170-971dccb5ac1e"
fetch likos-sub-obustroystvo.jpg "1581244277943-fe4a9c777189"
fetch likos-sub-biblioteka-dwg.jpg "1651890331040-b3e99782661f"

# --- Металлообработка
fetch likos-cat-metalloobrabotka.jpg "1587293852726-70cdb56c2866"
fetch likos-sub-plazma.jpg "1513828583688-c52646db42da"
fetch likos-sub-svarka.jpg "1581094794329-c8112a89af12"
fetch likos-sub-mo-pokraska.jpg "1544986581-efac024faf62"
fetch likos-sub-galvanika.jpg "1497366216548-37526070297c"
fetch likos-sub-podgotovka.jpg "1586528116311-ad8dd3c8310d"
fetch likos-sub-mo-obrabotka-metalla.jpg "1652888510609-ed2d2ad64d6b"

# --- Электрощиты и НКУ
fetch likos-cat-elektro.jpg "1581092921461-eab62e97a780"
fetch likos-sub-nku.jpg "1621905251189-08b45d6a269e"
fetch likos-sub-vv.jpg "1473341304170-971dccb5ac1e"
fetch likos-sub-apk.jpg "1563514227147-6d2ff665a6a0"
fetch likos-sub-shkafy-privoda.jpg "1582719478250-c89cae4dc85b"
fetch likos-sub-oem-pnr.jpg "1581094794329-c8112a89af12"

echo "Готово: $OUT ($(ls -1 "$OUT" | wc -l | tr -d ' ') файлов)"
