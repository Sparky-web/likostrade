import { typo } from "lib";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Text, VStack } from "~/components";

import { getCuttingPublic } from "./cuttingData";

type CuttingRows = Awaited<ReturnType<typeof getCuttingPublic>>["rows"];

const PriceTable = ({ rows }: { rows: CuttingRows }) => (
  <div className="overflow-x-auto rounded-xl border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{typo("Толщина металла, мм")}</TableHead>
          <TableHead>{typo("Рез, руб/пог. м")}</TableHead>
          <TableHead>{typo("Врезка, руб/шт")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.thickness}</TableCell>
            <TableCell>{row.pricePerMeter}</TableCell>
            <TableCell>{row.piercePrice}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

/** Актуальный прайс плазменной резки; данные тянет сам, настроек у блока нет.
 *  На мобильном — одна цельная таблица; на десктопе (lg+) те же строки разбиты на две колонки,
 *  чтобы длинный прайс не растягивал страницу. */
export const CuttingPriceTableBlock = async () => {
  const { rows, metalPricePerTon } = await getCuttingPublic();
  if (rows.length === 0) return null;

  const half = Math.ceil(rows.length / 2);
  const shouldSplit = rows.length > 8;

  return (
    <VStack gap="md">
      {/* Мобильный: одна таблица со всеми строками */}
      <div className={shouldSplit ? "lg:hidden" : undefined}>
        <PriceTable rows={rows} />
      </div>

      {/* Десктоп: две колонки рядом (только когда строк много) */}
      {shouldSplit ? (
        <div className="hidden items-start gap-4 lg:grid lg:grid-cols-2">
          <PriceTable rows={rows.slice(0, half)} />
          <PriceTable rows={rows.slice(half)} />
        </div>
      ) : null}

      <Text variant="small" color="supplementary">
        {typo(
          `Цены указаны для листовой стали. Стоимость металла — от ${new Intl.NumberFormat("ru-RU").format(metalPricePerTon)} руб/т. Точная стоимость рассчитывается по чертежам заказчика.`,
        )}
      </Text>
    </VStack>
  );
};
