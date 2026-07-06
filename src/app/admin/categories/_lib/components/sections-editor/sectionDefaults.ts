import type { CategorySection } from "~/sections/schema";

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
      return { id, type, items: [] as never };
    case "cards":
      return { id, type, items: [{ title: "" }] };
    case "special":
      return { id, type, block: "requestQuote" };
  }
}
