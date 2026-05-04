import { typo } from "lib";

import { AdaptiveGrid, Container, Heading, VideoCard, VStack } from "~/components";

export const Videos = () => {
  return (
    <Container>
      <VStack gap="section">
        <Heading variant="h2">{typo(`Видео`)}</Heading>
        <AdaptiveGrid cols={{ base: 1, md: 2, lg: 3 }} gap="lg">
          <VideoCard
            title={typo(`Привет`)}
            index="01"
            videoUrl="https://vkvideo.ru/video_ext.php?oid=-18403220&id=456239768&hash=e71b2695e6fe30f0&hd=3"
            description={typo(`Тест строки с переносами и отступами и столе лежит`)}
          />
          <VideoCard
            title="Video 2"
            index="02"
            videoUrl="https://vkvideo.ru/video_ext.php?oid=-18403220&id=456239768&hash=e71b2695e6fe30f0&hd=3"
            description="Description 1"
          />
          <VideoCard
            title="Video 1"
            index="03"
            videoUrl="https://vkvideo.ru/video_ext.php?oid=-18403220&id=456239768&hash=e71b2695e6fe30f0&hd=3"
            description="Description 1"
          />
        </AdaptiveGrid>
      </VStack>
    </Container>
  );
};
