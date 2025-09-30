# Navigation Configuration

The primary navigation bar reads from [`NAV_ITEMS`](../src/config/nav.ts), a shared list of `{ href, label }`
objects (with an optional `mobileIcon` glyph for compact menus). Update that array when you need to rename, reorder, add, or remove top-level sections. Because the component consumes
the exported list by default, no edits inside [`NavBar`](../src/components/chrome/NavBar.tsx) are required.

On smaller breakpoints the same data powers [`MobileNavDrawer`](../src/components/chrome/MobileNavDrawer.tsx), a sheet-based menu that opens from the hamburger trigger in `SiteChrome`. The drawer automatically closes when a destination is chosen, and it will dismiss itself if the viewport crosses up to the `md` breakpoint. No extra wiring is required—`SiteChrome` handles the open state and accessibility attributes.

For feature- or context-specific navigation, pass an `items` prop to `<NavBar />`:

```tsx
import NavBar from "@/components/chrome/NavBar";
import { NAV_ITEMS } from "@/config/nav";

const projectNav = [
  ...NAV_ITEMS,
  { href: "/projects", label: "Projects" },
];

export function ProjectChrome() {
  return <NavBar items={projectNav} />;
}
```

This pattern keeps the animation and active-state logic intact while allowing callers to opt into alternate menus when needed.
