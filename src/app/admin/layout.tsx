import type { Metadata } from "next";

import { websiteConstants } from "~/consts";

import { AdminLayoutClient } from "./_lib/components/AdminLayoutClient";

export const metadata: Metadata = {
  title: websiteConstants.ADMIN_METADATA_TITLE,
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
