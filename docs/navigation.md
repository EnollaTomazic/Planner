# Navigation Configuration

The primary navigation bar reads from [`NAV_ITEMS`](../src/components/chrome/nav-items.ts), a shared list of `{ href, label }`
objects. Update that array when you need to rename, reorder, add, or remove top-level sections. Because the component consumes
the exported list by default, no edits inside [`NavBar`](../src/components/chrome/NavBar.tsx) are required.

For feature- or context-specific navigation, pass an `items` prop to `<NavBar />`:

```tsx
import NavBar from "@/components/chrome/NavBar";
import { NAV_ITEMS } from "@/components/chrome/nav-items";

const projectNav = [
  ...NAV_ITEMS,
  { href: "/projects", label: "Projects" },
];

export function ProjectChrome() {
  return <NavBar items={projectNav} />;
}
```

This pattern keeps the animation and active-state logic intact while allowing callers to opt into alternate menus when needed.
