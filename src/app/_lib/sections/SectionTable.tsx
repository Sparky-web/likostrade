import { typo } from "lib";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components";
import type { TableSection } from "~/sections/schema";

import { SectionHeading } from "./SectionHeading";

export const SectionTable = ({ section }: { section: TableSection }) => {
  const columnCount = section.headerRow.length;

  return (
    <section>
      <SectionHeading title={section.title} />
      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              {section.headerRow.map((cell, index) => (
                <TableHead key={index} className="whitespace-normal">
                  {typo(cell)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {section.rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {/* Рендер толерантен к рассинхрону ширины: лишние ячейки отбрасываются, недостающие — пустые */}
                {Array.from({ length: columnCount }, (_, cellIndex) => (
                  <TableCell key={cellIndex} className="whitespace-normal">
                    {typo(row[cellIndex] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};
