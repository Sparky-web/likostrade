import { typo } from "lib";

import { AdaptiveGrid, Container, Heading, VideoCard, VStack } from "~/components";

import { type VideoListItem } from "../lib/videos";

interface VideosProps {
  videos: VideoListItem[];
}

const formatVideoIndex = (index: number) => String(index + 1).padStart(2, "0");

export function Videos({ videos }: VideosProps) {
  if (videos.length === 0) {
    return null;
  }

  return (
    <Container>
      <VStack gap="section">
        <Heading variant="h2">{typo(`Видео`)}</Heading>
        <AdaptiveGrid cols={{ base: 1, md: 2, lg: 3 }} gap="lg">
          {videos.map((video, index) => (
            <VideoCard
              key={video.id}
              title={typo(video.title)}
              index={formatVideoIndex(index)}
              videoUrl={video.url}
              description={video.description ? typo(video.description) : undefined}
            />
          ))}
        </AdaptiveGrid>
      </VStack>
    </Container>
  );
}
