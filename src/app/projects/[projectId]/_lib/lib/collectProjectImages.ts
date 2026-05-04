type ProjectImagesSource = {
  mainImageId: string | null;
  additionalImages: { id: string }[];
};

/** Главное фото первым, затем дополнительные без дубликатов. */
export const collectProjectImageIds = (project: ProjectImagesSource) => {
  const ids: string[] = [];
  if (project.mainImageId) {
    ids.push(project.mainImageId);
  }
  for (const image of project.additionalImages) {
    if (!ids.includes(image.id)) {
      ids.push(image.id);
    }
  }
  return ids;
};
