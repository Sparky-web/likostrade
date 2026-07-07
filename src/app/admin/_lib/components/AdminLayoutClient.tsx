"use client";

import { typo } from "lib";
import { redirect } from "next/navigation";

import { LkLayout, useUser, useUserLoading } from "~/components";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const isLoading = useUserLoading();

  // Ждём загрузку сессии: сервер и первый клиентский рендер отдают null (одинаково — без гидромисматча),
  // и только после getSession() решаем показывать админку или уводить на вход.
  if (isLoading) {
    return null;
  }

  if (!user) {
    return redirect("/auth/signin");
  }

  return (
    <LkLayout
      menu={{
        title: typo("Админ-панель"),
        items: [
          { title: typo("Заявки"), href: "/admin/leads" },
          { title: typo("Категории"), href: "/admin/categories" },
          { title: typo("Проекты"), href: "/admin/projects" },
          { title: typo("Видео"), href: "/admin/videos" },
          { title: typo("Цены резки"), href: "/admin/cutting" },
          { title: typo("Настройки"), href: "/admin/settings" },
          { title: typo("Файлы"), href: "/admin/files" },
        ],
      }}
    >
      {children}
    </LkLayout>
  );
}
