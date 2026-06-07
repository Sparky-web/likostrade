import { TRPCError } from "@trpc/server";
import fs from "fs/promises";
import { getBase64PayloadByteLength, isWithinMaxUploadFileSize, MAX_UPLOAD_FILE_SIZE_MB, zodRussian } from "lib";
import path from "path";

import { env } from "~/env";
import { db } from "~/server/db";

import { createTRPCRouter, publicProcedure } from "../trpc";

const uploadInput = zodRussian.object({
  file: zodRussian.string(),
  filename: zodRussian.string(),
});

async function saveUploadedFile(input: { file: string; filename: string }) {
  const uploadDir = env.UPLOAD_DIR_PUBLIC;

  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }

  const prefixedFilename = `${Date.now()}-${input.filename}`;
  const filePath = path.join(uploadDir, prefixedFilename);

  const byteLength = getBase64PayloadByteLength(input.file);
  if (!isWithinMaxUploadFileSize(byteLength)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Максимальный размер файла — ${MAX_UPLOAD_FILE_SIZE_MB} МБ`,
    });
  }

  const base64Data = input.file.replace(/^data:.+;base64,/, "");

  await fs.writeFile(filePath, base64Data, "base64");

  await db.file.create({
    data: {
      id: prefixedFilename,
    },
  });

  return {
    id: prefixedFilename,
  };
}

export const fileUploaderRouter = createTRPCRouter({
  upload: publicProcedure.input(uploadInput).mutation(async ({ input }) => saveUploadedFile(input)),
});
