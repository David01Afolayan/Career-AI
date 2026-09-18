const { spawn } = require("node:child_process");

const port = process.env.PORT || 3000;
const args = ["next", "start", "-H", "0.0.0.0", "-p", String(port)];
const command = process.platform === "win32" ? "npx.cmd" : "npx";

const child = spawn(command, args, {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: {
    ...process.env,
    PORT: String(port),
  },
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  }
  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error("Failed to start Next.js server:", error);
  process.exit(1);
});
