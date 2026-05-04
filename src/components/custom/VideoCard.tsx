import { Heading } from "../blaze/Heading";
import { HStack } from "../blaze/HStack";
import { Text } from "../blaze/Text";
import { VStack } from "../blaze/VStack";
import { Badge } from "../ui/badge";

interface VideoCardProps {
  title: string;
  index: string;
  videoUrl: string;
  description?: string;
}

export const VideoCard = ({ title, description, index, videoUrl }: VideoCardProps) => {
  return (
    <VStack className="bg-card overflow-hidden rounded-xl">
      <iframe src={videoUrl} title={title} className="aspect-video w-full" />
      <HStack className="p-6" gap="lg">
        <Badge variant="secondary" className="h-fit">
          <Heading variant="h4">{index}</Heading>
        </Badge>

        <VStack className="gap-0.5">
          <Text variant="large">{title}</Text>
          <Text variant="small" maxLines={3}>
            {description}
          </Text>
        </VStack>
      </HStack>
    </VStack>
  );
};
