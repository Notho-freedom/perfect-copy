const { spawn } = require("node:child_process");

// Some Windows environments export ELECTRON_RUN_AS_NODE globally,
// which makes Electron behave like plain Node and breaks the desktop app.
delete process.env.ELECTRON_RUN_AS_NODE;

const electronBinary = require("electron");

const child = spawn(electronBinary, ["."], {
  env: process.env,
  stdio: "inherit",
  windowsHide: false,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
