import { typo } from "lib";

import { Heading } from "~/components";

/** Необязательный заголовок секции; выводится единообразно над содержимым. */
export const SectionHeading = ({ title }: { title?: string }) => {
  if (!title) return null;
  return (
    <div className="mb-6">
      <Heading variant="h2">{typo(title)}</Heading>
    </div>
  );
};
