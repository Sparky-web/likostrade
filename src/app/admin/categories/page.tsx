"use client";

import { typo } from "lib";
import { useState } from "react";

import { Button, DataTable, Heading, Skeleton, useDataTable, useToggle, VStack } from "~/components";
import { api } from "~/trpc/react";

import { CategoryDetailsSidePanel } from "./_lib/components/CategoryDetailsSidePanel";
import { useCategoriesColumns } from "./_lib/model/useCategoriesColumns";

export default function CategoriesPage() {
  const [selectedId, setSelectedId] = useState<string>();
  const { isToggled: isCreationOpened, setTruthy: openCreation, setFalsy: closeCreation } = useToggle(false);

  const { data: categories, isPending, refetch } = api.categories.get.useQuery();

  const columns = useCategoriesColumns();

  const { table } = useDataTable({
    data: categories ?? [],
    columns,
    onRowClick: (row) => {
      setSelectedId(row.original.id);
    },
    clientSideProcessing: true,
  });

  if (isPending) return <Skeleton className="h-[400px]" />;

  return (
    <VStack gap="section" className="max-w-full overflow-x-auto">
      <Heading variant="h2">{typo("Категории")}</Heading>

      <DataTable table={table} />

      {selectedId ? (
        <CategoryDetailsSidePanel
          selectedId={selectedId}
          onClose={() => {
            setSelectedId(undefined);
            void refetch();
          }}
        />
      ) : undefined}

      {isCreationOpened ? (
        <CategoryDetailsSidePanel
          isCreation
          onClose={() => {
            closeCreation();
            void refetch();
          }}
        />
      ) : undefined}

      <Button onClick={openCreation} className="w-[200px]">
        {typo("Добавить")}
      </Button>
    </VStack>
  );
}
