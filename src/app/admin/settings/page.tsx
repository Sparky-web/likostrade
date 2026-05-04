"use client";

import { typo } from "lib";

import { CrudTableFormButton, FormFields, Heading, Skeleton, VStack } from "~/components";

import { useProjectOptions } from "../_lib";
import { useSiteSettingsForm } from "./_lib/model/useSiteSettingsForm";

export default function SiteSettingsPage() {
  const { isPending, form } = useSiteSettingsForm();
  const projectOptions = useProjectOptions();

  if (isPending) return <Skeleton className="h-[400px]" />;

  return (
    <VStack gap="section" className="max-w-2xl">
      <Heading variant="h2">{typo("Настройки сайта")}</Heading>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <VStack gap="lg">
          <FormFields
            form={form}
            fields={[
              {
                name: "homepagePinnedProjectIds",
                type: "selectMultiple",
                label: typo("Закреплённые работы на главной"),
                placeholder: typo("Выберите работы"),
                inputProps: {
                  options: projectOptions,
                },
              },
            ]}
          />

          <CrudTableFormButton form={form} label={typo("Сохранить")} />
        </VStack>
      </form>
    </VStack>
  );
}
