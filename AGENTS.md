<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->

## Frontend Styling Policy

- Use Tailwind CSS utility classes as the default for all new Vue components
  and layouts.
- Keep component `<style scoped>` blocks or custom CSS only when Tailwind
  cannot express the requirement cleanly.
- Before adding custom CSS, prefer existing design tokens, responsive
  variants, state variants, arbitrary values, and arbitrary properties.
- Valid custom CSS cases include complex pseudo-elements, third-party
  component internals requiring `:deep()`, unsupported browser-specific
  behavior, and reusable global primitives that are clearer outside templates.
- Do not move ordinary spacing, sizing, color, typography, layout, responsive,
  hover, focus, disabled, or transition rules into custom CSS.
- Define reusable project colors, fonts, spacing, shadows, and animations as
  Tailwind v4 `@theme` tokens in `src/assets/styles/main.css`.
- When custom CSS is necessary, keep it minimal and colocated with the owning
  component unless it is an intentional global token or primitive.
