import { typo } from "lib";
import type { Metadata } from "next";

import { Headline, VStack } from "~/components";
import { websiteConstants } from "~/consts";
import { api, HydrateClient } from "~/trpc/server";

import { AboutUs } from "./_lib/components/AboutUs";
import { CategoryTilesSection } from "./_lib/components/CategoryTilesSection";
import { ClientsPartnersSection } from "./_lib/components/ClientsPartnersSection";
import { Contacts } from "./_lib/components/Contacts";
import { HomeCompletedProjects } from "./_lib/components/HomeCompletedProjects";
import { Licenses } from "./_lib/components/Licenses";
import { RequestForm } from "./_lib/components/RequestForm";
import { RequestFormScrollButton } from "./_lib/components/RequestFormScrollButton";
import { Videos } from "./_lib/components/Videos";
import heroImage from "./_lib/lib/headline.jpg";

export const metadata: Metadata = {
  title: websiteConstants.METADATA_TITLE,
  description: websiteConstants.METADATA_DESCRIPTION,
};

export default async function Home() {
  const [rootCategories, previewVideos] = await Promise.all([
    api.categories.get({
      where: { parentCategories: { none: {} }, isHidden: false },
    }),
    api.videos.getPreview(),
  ]);

  return (
    <HydrateClient>
      <Headline
        title={typo("Поставщик металлоконструкций для вашего проекта")}
        button={<RequestFormScrollButton />}
        image={heroImage}
      />
      <VStack gap="section">
        <CategoryTilesSection categories={rootCategories} />
        <AboutUs />
        <HomeCompletedProjects />
        <ClientsPartnersSection />
        <Videos videos={previewVideos} />
        <Licenses />
        <RequestForm />
      </VStack>
      <Contacts />
    </HydrateClient>
  );
}
