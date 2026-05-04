/** Стили для белого popover в тёмной теме: дочерние ссылки не наследуют светлый --foreground. */
export const popoverSurfaceStyles =
  "[&_a]:text-popover-foreground [&_a]:hover:text-popover-foreground/85 [&_button]:text-popover-foreground";

/** Лёгкая подсветка пункта (Radix focus / open), как у подпунктов SiteMenu. */
export const popoverItemFocusStyles =
  "focus:bg-popover-foreground/10 focus:text-popover-foreground data-open:bg-popover-foreground/10 data-open:text-popover-foreground";

/** Лёгкая подсветка пункта (Base UI data-highlighted). */
export const popoverItemHighlightedStyles =
  "data-highlighted:bg-popover-foreground/10 data-highlighted:text-popover-foreground data-highlighted:[&_[data-slot=checkbox-indicator]]:text-primary-foreground data-highlighted:[&_[data-slot=checkbox-indicator]_svg]:text-primary-foreground";

/** Лёгкая подсветка выбранного пункта (cmdk data-selected). */
export const popoverItemSelectedStyles =
  "data-selected:bg-popover-foreground/10 data-selected:text-popover-foreground";
