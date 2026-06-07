import { typo } from "lib";

import { FieldContent, FieldDescription, FieldLabel, Link, VStack } from "~/components";
import type { RouterOutputs } from "~/trpc/react";

type VideoDetailsProps = {
  data: NonNullable<RouterOutputs["videos"]["getById"]>;
};

const EMPTY = "—";

const joinTitles = (items: { title: string }[]) => (items.length ? items.map((item) => item.title).join(", ") : EMPTY);

export const VideoDetails = ({ data }: VideoDetailsProps) => {
  return (
    <VStack gap="lg">
      <FieldContent>
        <FieldLabel>{typo("ID")}</FieldLabel>
        <FieldDescription>{data.id}</FieldDescription>
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Название")}</FieldLabel>
        <FieldDescription>{data.title}</FieldDescription>
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Описание")}</FieldLabel>
        <FieldDescription>{data.description || EMPTY}</FieldDescription>
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("URL")}</FieldLabel>
        <FieldDescription>
          <Link href={data.url} target="_blank" rel="noreferrer noopener" className="underline underline-offset-2">
            {data.url}
          </Link>
        </FieldDescription>
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Категории")}</FieldLabel>
        <FieldDescription>{joinTitles(data.categories)}</FieldDescription>
      </FieldContent>
    </VStack>
  );
};
