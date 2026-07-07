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

/** Актуальный прайс плазменной резки; данные тянет сам, настроек у блока нет. На десктопе — две колонки, чтобы таблица не растягивала страницу. */
export const CuttingPriceTableBlock = async () => {
  const { rows, metalPricePerTon } = await getCuttingPublic();
  if (rows.length === 0) return null;

  const half = Math.ceil(rows.length / 2);
  const columns = rows.length > 8 ? [rows.slice(0, half), rows.slice(half)] : [rows];

  return (
    <VStack gap="md">
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        {columns.map((columnRows, i) => (
          <PriceTable key={i} rows={columnRows} />
        ))}
      </div>
      <Text variant="small" color="supplementary">
        {typo(
          `Цены указаны для листовой стали. Стоимость металла — от ${new Intl.NumberFormat("ru-RU").format(metalPricePerTon)} руб/т. Точная стоимость рассчитывается по чертежам заказчика.`,
        )}
      </Text>
    </VStack>
  );
};
