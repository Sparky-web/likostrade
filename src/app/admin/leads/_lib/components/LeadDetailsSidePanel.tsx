"use client";

import { typo } from "lib";

import { SidePanel, Skeleton } from "~/components";

import { useLeadById } from "../api/useLeadById";
import { LeadDetails } from "./LeadDetails";

export type LeadDetailsSidePanelProps = {
  selectedId: string;
  onClose: () => void;
};

export const LeadDetailsSidePanel = ({ selectedId, onClose }: LeadDetailsSidePanelProps) => {
  const { data, isPending } = useLeadById(selectedId);

  return (
    <SidePanel title={typo("Детали заявки")} isOpen onClose={onClose}>
      {isPending ? <Skeleton className="h-[400px]" /> : undefined}
      {data ? <LeadDetails data={data} /> : undefined}
    </SidePanel>
  );
};
