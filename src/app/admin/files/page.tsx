"use client";

import { typo } from "lib";
import { useState } from "react";

import { Button, DataTable, Heading, Skeleton, useDataTable, useToggle, VStack } from "~/components";
import { api } from "~/trpc/react";

import { FileDetailsSidePanel } from "./_lib/components/FileDetailsSidePanel";
import { useFilesColumns } from "./_lib/model/useFilesColumns";

export default function FilesPage() {
  const [selectedId, setSelectedId] = useState<string>();
  const { isToggled: isCreationOpened, setTruthy: openCreation, setFalsy: closeCreation } = useToggle(false);

  const { data: files, isPending, refetch } = api.files.get.useQuery();

  const columns = useFilesColumns();

  const { table } = useDataTable({
    data: files ?? [],
    columns,
    onRowClick: (row) => {
      setSelectedId(row.original.id);
    },
    clientSideProcessing: true,
  });

  if (isPending) return <Skeleton className="h-[400px]" />;

  return (
    <VStack gap="section" className="max-w-full overflow-x-auto">
      <Heading variant="h2">{typo("Файлы")}</Heading>

      <DataTable table={table} />

      {selectedId ? (
        <FileDetailsSidePanel
          selectedId={selectedId}
          onClose={() => {
            setSelectedId(undefined);
            void refetch();
          }}
        />
      ) : undefined}

      {isCreationOpened ? (
        <FileDetailsSidePanel
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
