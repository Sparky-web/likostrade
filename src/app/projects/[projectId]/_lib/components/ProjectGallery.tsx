"use client";

import type { StaticImageData } from "next/image";

import { Carousel, ClickableImage } from "~/components";

type ProjectGalleryProps = {
  imageIds: string[];
  title: string;
  fallbackImage: StaticImageData;
};

export const ProjectGallery = ({ imageIds, title, fallbackImage }: ProjectGalleryProps) => {
  const slides =
    imageIds.length > 0
      ? imageIds.map((id) => (
          <ClickableImage
            key={id}
            src={`/uploads/${id}`}
            alt={title}
            width={960}
            height={720}
            className="h-[300px] rounded-lg md:mx-2"
          />
        ))
      : [<ClickableImage key="fallback" src={fallbackImage} alt={title} className="h-[300px] w-full rounded-lg" />];

  const visibleCount = Math.min(4, slides.length);

  return (
    <Carousel
      mobileWidth={280}
      slidesAmount={{ md: Math.min(2, visibleCount), lg: visibleCount }}
      slides={slides}
      dots={slides.length > 1}
    />
  );
};
