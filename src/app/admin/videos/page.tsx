"use client";

import { typo } from "lib";
import { useState } from "react";

import { Button, DataTable, DataTableToolbar, Heading, Skeleton, useDataTable, useToggle, VStack } from "~/components";
import { api } from "~/trpc/react";

import { VideoDetailsSidePanel } from "./_lib/components/VideoDetailsSidePanel";
import { useVideosColumns } from "./_lib/model/useVideosColumns";

export default function VideosPage() {
  const [selectedId, setSelectedId] = useState<string>();
  const { isToggled: isCreationOpened, setTruthy: openCreation, setFalsy: closeCreation } = useToggle(false);

  const { data: videos, isPending, refetch } = api.videos.get.useQuery();

  const columns = useVideosColumns();

  const { table } = useDataTable({
    data: videos ?? [],
    columns,
    onRowClick: (row) => {
      setSelectedId(row.original.id);
    },
    clientSideProcessing: true,
  });

  if (isPending) return <Skeleton className="h-[400px]" />;

  return (
    <VStack gap="section" className="max-w-full overflow-x-auto">
      <Heading variant="h2">{typo("Видео")}</Heading>

      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>

      {selectedId ? (
        <VideoDetailsSidePanel
          selectedId={selectedId}
          onClose={() => {
            setSelectedId(undefined);
            void refetch();
          }}
        />
      ) : undefined}

      {isCreationOpened ? (
        <VideoDetailsSidePanel
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
