import type { CategorySection, GallerySection } from "~/sections/schema";

/** Заготовка новой секции выбранного типа; id — стабильный ключ для React и reorder. */
export function makeSection(type: CategorySection["type"]): CategorySection {
  const id = crypto.randomUUID();
  switch (type) {
    case "text":
      return { id, type, html: "" };
    case "table":
      return { id, type, headerRow: ["", ""], rows: [["", ""]] };
    case "files":
      return { id, type, items: [] };
    case "video":
      return { id, type, url: "" };
    case "gallery":
      // Пустая заготовка допустима в редакторе; при сохранении пустая галерея отбрасывается (normalizeSectionsForSave)
      return { id, type, items: [] as GallerySection["items"] };
    case "cards":
      return { id, type, items: [{ title: "" }] };
    case "imageCards":
      return { id, type, items: [{ imageId: "", title: "" }] };
    case "mediaText":
      return { id, type, html: "", imageId: "", imagePosition: "right" };
    case "steps":
      return { id, type, items: [{ title: "" }] };
    case "stats":
      return { id, type, items: [{ value: "" }] };
    case "callout":
      return { id, type, variant: "highlight", text: "" };
    case "special":
      return { id, type, block: "requestQuote" };
  }
}
