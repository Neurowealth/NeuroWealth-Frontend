# Theme Architecture & Persistence

This document explains how NeuroWealth handles theme (light/dark) persistence, initialization, and prevents "Flash of Unstyled Content" (FOUC) during initial page load.

## Storage Contract
- **Persistence Key**: \`nw-theme\`
- **Stored Value Format**: String. Can be exactly one of: \`"light"\`, \`"dark"\`, or \`"system"\`.

## Theme Behavior
- **System Preference**: If the stored value is \`"system"\` (or if no value is present), the application queries the browser's \`prefers-color-scheme\` media query. If the browser prefers dark mode, the \`dark\` class is applied. Otherwise, \`light\` is applied.
- **Dark/Light Forced**: If the stored value is explicitly \`"dark"\` or \`"light"\`, the system preference is ignored and the chosen theme is forced.
- **SSR Fallback**: The server always renders the \`<html>\` element with the \`dark\` class by default. This ensures that users without JavaScript enabled or during the initial HTML payload delivery see a consistent dark theme (since NeuroWealth is a dark-first application).

## Initialization Flow (Preventing FOUC)
1. **Boot Script (Head Injection)**: In \`src/app/layout.tsx\`, an inline script is injected directly into the \`<head>\` using \`dangerouslySetInnerHTML\`. This script executes synchronously, blocking the parsing of the \`<body>\`.
2. **Synchronous Evaluation**: The script reads \`nw-theme\` from \`localStorage\`. If it resolves to \`dark\` or \`light\` (either stored or via system preference), it synchronously modifies the \`class\` attribute of the \`<html>\` element *before* any UI paints. This guarantees zero flash.
3. **React Hydration (ThemeProvider)**: The React tree hydrates with a default \`"system"\` state (and \`dark\` resolved theme) to match the server output, avoiding hydration mismatch errors.
4. **Client Mount**: Immediately after mounting, a \`useEffect\` hook in \`ThemeProvider\` reads the actual stored value, updates the React context state, and sets a \`mounted\` boolean to \`true\`.
5. **Component Rendering**: Components that render theme-specific UI (like \`ThemeToggle\` or \`ThemeSettings\`) use the \`mounted\` flag to defer rendering until the true client-side theme is known, preventing brief icon/label flashes.

## Testing & QA
To verify theme persistence:
1. Open DevTools -> Application -> Local Storage.
2. Navigate to Settings -> Appearance.
3. Switch to "Light" mode. Observe \`nw-theme\` changes to \`"light"\`.
4. Hard refresh the page (Cmd/Ctrl + Shift + R).
5. Ensure the page immediately loads in Light mode without any brief flash of dark mode UI.
6. Delete the \`nw-theme\` key and refresh. The app should default to your OS system preference.
