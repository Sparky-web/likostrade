"use client";

import { typo } from "lib";
import { parseAsString, useQueryState } from "nuqs";

import { DataTable, Heading, Skeleton, useDataTable, VStack } from "~/components";
import { api } from "~/trpc/react";

import { LeadDetailsSidePanel } from "./_lib/components/LeadDetailsSidePanel";
import { useLeadsColumns } from "./_lib/model/useLeadsColumns";

export default function LeadsPage() {
  const [selectedId, setSelectedId] = useQueryState("id", parseAsString);

  const { data: leads, isPending } = api.leads.get.useQuery();
  const columns = useLeadsColumns();

  const { table } = useDataTable({
    data: leads ?? [],
    columns,
    onRowClick: (row) => {
      void setSelectedId(row.original.id);
    },
    clientSideProcessing: true,
  });

  if (isPending) return <Skeleton className="h-[400px]" />;

  return (
    <VStack gap="section" className="max-w-full overflow-x-auto">
      <Heading variant="h2">{typo("Заявки")}</Heading>

      <DataTable table={table} />

      {selectedId ? (
        <LeadDetailsSidePanel
          selectedId={selectedId}
          onClose={() => {
            void setSelectedId(null);
          }}
        />
      ) : undefined}
    </VStack>
  );
};
