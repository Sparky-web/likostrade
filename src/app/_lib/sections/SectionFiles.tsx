import "server-only";

import { stat } from "node:fs/promises";
import { join } from "node:path";

import { typo } from "lib";
import { Download, FileText } from "lucide-react";

import { HStack, Link, Text, VStack } from "~/components";
import { env } from "~/env";
import type { FilesSection } from "~/sections/schema";
import { stripUploadPrefix } from "~/sections/schema";

import { SectionHeading } from "./SectionHeading";

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return typo(`${(bytes / (1024 * 1024)).toFixed(1)} МБ`);
  return typo(`${Math.max(1, Math.round(bytes / 1024))} КБ`);
}

async function readFileSize(fileId: string): Promise<string | null> {
  try {
    const info = await stat(join(env.UPLOAD_DIR_PUBLIC, fileId));
    return info.isFile() ? formatFileSize(info.size) : null;
  } catch {
    return null;
  }
}

export const SectionFiles = async ({ section }: { section: FilesSection }) => {
  if (section.items.length === 0) return null;

  const sizes = await Promise.all(section.items.map((item) => readFileSize(item.fileId)));

  return (
    <section>
      <SectionHeading title={section.title} />
      <VStack gap="sm">
        {section.items.map((item, index) => (
          <Link
            key={item.fileId}
            href={`/uploads/${item.fileId}`}
            download={item.label ? undefined : stripUploadPrefix(item.fileId)}
            target="_blank"
            rel="noopener"
            prefetch={false}
            className="group block w-full"
          >
            <HStack gap="md" align="center" className="bg-card hover:bg-secondary rounded-xl border p-4 transition-colors">
              <VStack className="bg-secondary size-12 min-w-12 rounded-lg" align="center" justify="center">
                <FileText className="text-primary size-5" aria-hidden />
              </VStack>
              <VStack className="min-w-0 flex-1 gap-0.5">
                <span className="truncate font-medium">{typo(item.label ?? stripUploadPrefix(item.fileId))}</span>
                {sizes[index] ? <Text variant="small">{sizes[index]}</Text> : null}
              </VStack>
              <Download className="text-muted-foreground group-hover:text-foreground size-5 shrink-0 transition-colors" aria-hidden />
            </HStack>
          </Link>
        ))}
      </VStack>
    </section>
  );
};
