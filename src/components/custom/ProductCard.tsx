import type { StaticImageData } from "next/image";
import Image from "next/image";
import Link from "next/link";

import { formatDate } from "../blaze/DataTable/lib/formatDate";
import { Heading } from "../blaze/Heading";
import { HStack } from "../blaze/HStack";
import { Text } from "../blaze/Text";
import { VStack } from "../blaze/VStack";
import placeholderImage from "../lib/placeholder.jpg";
import { Badge } from "../ui/badge";

interface ProductCardProps {
  href: string;
  image?: StaticImageData | string | undefined;
  title: string;
  /** Календарная дата выполнения работы (YYYY-MM-DD). */
  dateCompleted?: string;
  description: string;
  badges?: string[];
}

export const ProductCard = ({ href, image, title, dateCompleted, description, badges }: ProductCardProps) => {
  const dateCompletedLabel = dateCompleted ? formatDate(dateCompleted) : undefined;
  return (
    <Link href={href} className="group block no-underline">
      <VStack gap="md">
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-md">
          <Image
            src={image || placeholderImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {badges?.length ? (
            <HStack gap="xs" align="center" className="absolute right-3 bottom-3 left-3 flex-wrap">
              {badges.map((label, index) => (
                <Badge key={index} variant="default">
                  {label}
                </Badge>
              ))}
            </HStack>
          ) : undefined}
        </div>
        <VStack gap="xs">
          <Heading variant="h3" maxLines={3}>
            {title}
          </Heading>
          {dateCompletedLabel ? <Text variant="muted">{dateCompletedLabel}</Text> : undefined}
          {description ? <Text maxLines={4}>{description}</Text> : undefined}
        </VStack>
      </VStack>
    </Link>
  );
};
