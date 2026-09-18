const { existsSync } = require("node:fs");
const { join } = require("node:path");
const { spawn } = require("node:child_process");
const { platform } = process;

const root = join(__dirname, "..");
const electronBinary = platform === "darwin"
  ? join(root, "node_modules", "electron", "dist", "Electron.app", "Contents", "MacOS", "Electron")
  : join(root, "node_modules", "electron", platform === "win32" ? "electron.exe" : "electron");

function launch(command, args) {
  const child = spawn(command, args, { cwd: root, stdio: "inherit" });
  child.on("error", (error) => {
    console.error(`Could not start Locked In: ${error.message}`);
    process.exitCode = 1;
  });
}

if (existsSync(electronBinary)) {
  launch(electronBinary, ["."]);
} else {
  const packagedApp = platform === "darwin"
    ? join(root, "dist", "mac-arm64", "Locked In.app")
    : join(root, "dist");

  if (platform === "darwin" && existsSync(packagedApp)) {
    console.warn("Electron's development binary is missing; opening the latest packaged app instead.");
    launch("open", [packagedApp]);
  } else {
    console.error("Electron's desktop binary is missing.");
    console.error("Run `npm run approve-electron` once, then run `npm install` and `npm start` again.");
    console.error("If you only need a downloadable app, run `npm run dist`.");
    process.exitCode = 1;
  }
}
