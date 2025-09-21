# Manual QA Checklist

For each page verify:

- Spacing follows the design scale.
- Hairline borders with a single focus ring.
- Consistent radius across components.
- Colors originate from tokens, avoiding raw values.
- A reduced-motion path is available and honors `prefers-reduced-motion`.

## Components gallery focus management

- Pointer activation: Open the components gallery, select the "Tokens" view with the mouse, and confirm the tab content does not scroll and the active tab keeps focus.
- Keyboard activation: Use the keyboard to move between the gallery view tabs, activate the "Tokens" view with Enter/Space and confirm focus moves into the tokens panel. Move back to the components view with the keyboard and ensure focus shifts into the component panel instead of staying on the tab.
