import { typo } from "lib";

import type { VideoSection } from "~/sections/schema";

import { SectionHeading } from "./SectionHeading";

export const SectionVideo = ({ section }: { section: VideoSection }) => (
  <section>
    <SectionHeading title={section.title} />
    <iframe
      src={section.url}
      title={section.title ?? typo("Видео")}
      className="aspect-video w-full rounded-xl border-0"
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      allowFullScreen
    />
  </section>
);
