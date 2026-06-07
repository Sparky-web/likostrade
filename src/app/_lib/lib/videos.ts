import type { RouterOutputs } from "~/trpc/react";

export type VideoListItem = RouterOutputs["videos"]["get"][number];

export const VIDEO_PREVIEW_LIMIT = 3;
