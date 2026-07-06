-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "homepagePinnedProjectIds" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);
