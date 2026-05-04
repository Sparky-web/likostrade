import fs from "fs/promises";
import { zodRussian } from "lib";
import path from "path";

import { env } from "~/env";
import { db } from "~/server/db";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const fileUploaderRouter = createTRPCRouter({
  upload: protectedProcedure
    .input(
      zodRussian.object({
        file: zodRussian.string(),
        filename: zodRussian.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const uploadDir = env.UPLOAD_DIR_PUBLIC;

      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      const prefixedFilename = `${Date.now()}-${input.filename}`;
      const filePath = path.join(uploadDir, prefixedFilename);

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
    }),
});
