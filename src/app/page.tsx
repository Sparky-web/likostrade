import { typo } from "lib";

import { Button, Headline, VStack } from "~/components";
import { api, HydrateClient } from "~/trpc/server";

import { AboutUs } from "./_lib/components/AboutUs";
import { CategoryTilesSection } from "./_lib/components/CategoryTilesSection";
import { ClientsPartnersSection } from "./_lib/components/ClientsPartnersSection";
import { Contacts } from "./_lib/components/Contacts";
import { HomeCompletedProjects } from "./_lib/components/HomeCompletedProjects";
import { Licenses } from "./_lib/components/Licenses";
import { RequestForm } from "./_lib/components/RequestForm";
import { Videos } from "./_lib/components/Videos";
import heroImage from "./_lib/lib/headline.jpg";

export default async function Home() {
  const rootCategories = await api.categories.get({
    where: { parentCategories: { none: {} }, isHidden: false },
  });

  return (
    <HydrateClient>
      <Headline
        title={typo("Поставщик металлоконструкций для вашего проекта")}
        button={
          <Button size="lg" className="rounded-md">
            {typo(`Оформить заявку`)}
          </Button>
        }
        image={heroImage}
      />
      <VStack gap="section">
        <CategoryTilesSection categories={rootCategories} />
        <AboutUs />
        <HomeCompletedProjects />
        <ClientsPartnersSection />
        <Videos />
        <Licenses />
        <RequestForm />
      </VStack>
      <Contacts />
    </HydrateClient>
  );
}
