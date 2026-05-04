"use client";

import { typo } from "lib";
import { useState } from "react";

import {
  Button,
  DataTable,
  DataTableToolbar,
  Heading,
  Skeleton,
  useDataTable,
  useToggle,
  VStack,
} from "~/components";
import { api } from "~/trpc/react";

import { ProjectDetailsSidePanel } from "./_lib/components/ProjectDetailsSidePanel";
import { useProjectsColumns } from "./_lib/model/useProjectsColumns";

export default function ProjectsPage() {
  const [selectedId, setSelectedId] = useState<string>();
  const { isToggled: isCreationOpened, setTruthy: openCreation, setFalsy: closeCreation } = useToggle(false);

  const { data: projects, isPending, refetch } = api.projects.get.useQuery();
  const columns = useProjectsColumns();

  const { table } = useDataTable({
    data: projects ?? [],
    columns,
    onRowClick: (row) => {
      setSelectedId(row.original.id);
    },
    clientSideProcessing: true,
  });

  if (isPending) return <Skeleton className="h-[400px]" />;

  return (
    <VStack gap="section" className="max-w-full overflow-x-auto">
      <Heading variant="h2">{typo("Проекты")}</Heading>

      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>

      {selectedId ? (
        <ProjectDetailsSidePanel
          selectedId={selectedId}
          onClose={() => {
            setSelectedId(undefined);
            void refetch();
          }}
        />
      ) : undefined}

      {isCreationOpened ? (
        <ProjectDetailsSidePanel
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
