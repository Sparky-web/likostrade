"use client";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Carousel.css";

import type { CSSProperties, ReactNode } from "react";
import { useMemo } from "react";
import Slider, { type Settings } from "react-slick";

import { ScrollArea } from "~/components/ui/scroll-area";

export type CarouselProps = {
  slides: ReactNode[];
  /** maxWidth обёртки слайда в горизонтальном ScrollArea при ширине viewport меньше 768px. */
  mobileWidth: CSSProperties["maxWidth"];
  slidesAmount: {
    md: number;
    lg: number;
  };
  dots?: boolean;
};

export const Carousel = ({ slides, mobileWidth, slidesAmount, dots = true }: CarouselProps) => {
  const settings: Settings = useMemo(
    () => ({
      dots,
      infinite: true,
      speed: 500,
      slidesToShow: slidesAmount.lg,
      slidesToScroll: 1,

      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: slidesAmount.md,
            slidesToScroll: 1,
          },
        },
      ],
      arrows: true,
    }),
    [dots, slidesAmount.lg, slidesAmount.md],
  );

  const mobileSlideStyle: CSSProperties = { maxWidth: mobileWidth };

  return (
    <>
      <div className="hidden md:block">
        <Slider {...settings}>
          {slides.map((slide, index) => (
            <div key={index}>{slide}</div>
          ))}
        </Slider>
      </div>
      <ScrollArea orientation="horizontal" className="w-full md:hidden">
        <div className="flex w-max flex-row gap-4 pb-3">
          {slides.map((slide, index) => (
            <div key={index} className="shrink-0" style={mobileSlideStyle}>
              {slide}
            </div>
          ))}
        </div>
      </ScrollArea>
    </>
  );
};
