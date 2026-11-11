REPAIRFLOW — GRAPHITE & COPPER THEME UPDATE

This package includes the complete frontend files for the selected Graphite & Copper palette,
Refined minimal visual style, and Light / Dark / System theme behaviour.

Files to replace in your project:
- frontend/src/App.jsx
- frontend/src/App.css
- frontend/src/main.jsx
- frontend/src/pages/admin/AdminDashboard.jsx

The App.jsx retains the theme selector and persists the selected mode in localStorage.
System mode follows the operating system's prefers-color-scheme setting.
The stylesheet preserves the supplied application CSS and adds the Graphite & Copper
light/dark design tokens and component-level styling.

Before replacing files, create backups:

  cd ~/Projects/RepairFlow
  cp frontend/src/App.jsx frontend/src/App.jsx.backup
  cp frontend/src/App.css frontend/src/App.css.backup
  cp frontend/src/main.jsx frontend/src/main.jsx.backup
  cp frontend/src/pages/admin/AdminDashboard.jsx frontend/src/pages/admin/AdminDashboard.jsx.backup

Extract this ZIP into the project root's frontend directory (not into frontend/frontend):

  unzip -o ~/Downloads/RepairFlow-Graphite-Copper-Update.zip -d frontend

Then test locally:

  cd ~/Projects/RepairFlow/frontend
  npm run lint
  npm run build
  npm run dev

Do not deploy to the homelab until the local lint/build checks and visual review are complete.
