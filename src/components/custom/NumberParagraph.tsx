import { VStack } from "..";
import { Heading } from "../blaze/Heading";

interface NumberParagraphProps {
  number: string;
  description: string;
}

export const NumberParagraph = ({ number, description }: NumberParagraphProps) => {
  return (
    <VStack gap="sm">
      <Heading variant="h2">{number}</Heading>
      <div className="font-mono">{description}</div>
    </VStack>
  );
};
