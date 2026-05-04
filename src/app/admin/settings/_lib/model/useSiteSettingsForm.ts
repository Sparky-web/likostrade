"use client";

import { useForm } from "@tanstack/react-form";
import { typo } from "lib";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

export const useSiteSettingsForm = () => {
  const { data, isPending, refetch } = api.siteSettings.get.useQuery();
  const { mutateAsync: update } = api.siteSettings.update.useMutation();

  const mappedData = useMemo(() => {
    if (!data) return null;

    return {
      homepagePinnedProjectIds: data.homepagePinnedProjectIds,
    };
  }, [data]);

  const form = useForm({
    defaultValues: mappedData ?? {
      homepagePinnedProjectIds: [] satisfies string[] as string[],
    },

    onSubmit: async ({ value }) => {
      try {
        await update({
          homepagePinnedProjectIds: value.homepagePinnedProjectIds,
        });

        void refetch();
        toast.success(typo("Настройки сохранены"));
      } catch (error) {
        console.error(error);
        toast.error(typo("Не удалось сохранить настройки"));
      }
    },
  });

  useEffect(() => {
    if (mappedData) {
      form.reset(mappedData);
    }
  }, [form, mappedData]);

  return {
    data,
    isPending,
    form,
  };
};
