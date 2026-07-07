-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "showClientsPartners" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showContacts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showLicenses" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showRequestForm" BOOLEAN NOT NULL DEFAULT true;
