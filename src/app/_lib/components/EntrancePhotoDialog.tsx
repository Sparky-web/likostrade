import { typo } from "lib";
import { Camera } from "lucide-react";
import Image from "next/image";

import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components";
import { websiteConstants } from "~/consts";

export const EntrancePhotoDialog = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="secondary" size="lg" className="w-fit">
        <Camera aria-hidden />
        {typo("Фото въезда")}
      </Button>
    </DialogTrigger>

    <DialogContent className="max-h-[calc(100dvh-1rem)] max-w-[calc(100vw-1rem)] gap-3 overflow-hidden rounded-2xl p-2 sm:max-w-5xl sm:p-4">
      <DialogHeader className="pr-10">
        <DialogTitle>{typo("Фото въезда")}</DialogTitle>
        <DialogDescription>{websiteConstants.ADDRESS}</DialogDescription>
      </DialogHeader>

      <Image
        src="/images/likos-entrance.jpg"
        alt={typo("Въезд на территорию ООО «Ликос»")}
        width={1280}
        height={960}
        sizes="(max-width: 640px) calc(100vw - 2rem), 1024px"
        className="max-h-[calc(100dvh-6rem)] w-full rounded-xl object-contain"
      />
    </DialogContent>
  </Dialog>
);
