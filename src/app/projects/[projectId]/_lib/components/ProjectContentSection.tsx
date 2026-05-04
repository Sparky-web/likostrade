import { Heading } from "~/components";

type ProjectContentSectionProps = {
  title: string;
  html: string;
};

export const ProjectContentSection = ({ title, html }: ProjectContentSectionProps) => {
  return (
    <section className="grid grid-cols-1 items-start gap-4 py-8 md:grid-cols-[minmax(0,16rem)_1fr] md:gap-12 lg:grid-cols-[minmax(0,20rem)_1fr]">
      <div className="md:pt-1">
        <Heading variant="h3">{title}</Heading>
      </div>
      <div className="rich-html-content text-base md:text-lg" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
};
