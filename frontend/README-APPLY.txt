REPAIRFLOW — GRAPHITE & COPPER THEME UPDATE

IMPORTANT: This archive is structured with src/ at its root. Extract it directly
into the frontend directory so it replaces frontend/src/* (not into a nested folder).

From the project root:
  cd ~/Projects/RepairFlow

Back up the current files:
  cp frontend/src/App.jsx frontend/src/App.jsx.backup
  cp frontend/src/App.css frontend/src/App.css.backup
  cp frontend/src/main.jsx frontend/src/main.jsx.backup
  cp frontend/src/pages/admin/AdminDashboard.jsx frontend/src/pages/admin/AdminDashboard.jsx.backup

Extract:
  unzip -o ~/Downloads/RepairFlow-Graphite-Copper-Update.zip -d frontend

The resulting paths must be:
  frontend/src/App.jsx
  frontend/src/App.css
  frontend/src/main.jsx
  frontend/src/pages/admin/AdminDashboard.jsx

Do not proceed if extraction creates frontend/RepairFlow-Graphite-Copper/src or frontend/src/src.

Test locally:
  cd frontend
  npm run lint
  npm run build
  npm run dev

Do not deploy to the homelab until local checks and visual review pass.
