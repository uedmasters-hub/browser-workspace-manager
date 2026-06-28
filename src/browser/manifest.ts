import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,

  name: "Browser Workspace Manager",

  version: "0.1.0",

  description: "Manage browser windows and tabs.",

  permissions: [
    "tabs",
    "tabGroups",
    "storage",
    "bookmarks",
    "history",
    "downloads",
    "sessions"
  ],

  host_permissions: [
    "<all_urls>"
  ],

  action: {
    default_popup: "src/browser/popup/index.html"
  },

  commands: {
    _execute_action: {
      suggested_key: {
        default: "Ctrl+Shift+Space",
        mac: "Command+Shift+Space"
      },
      description: "Open Browser Workspace Manager"
    }
  },

  background: {
    service_worker: "src/browser/background/index.ts",
    type: "module"
  }
});
