import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walk(fullPath);
      }
      return fullPath.endsWith(".js") ? [fullPath] : [];
    })
  );

  return files.flat();
};

const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: "inherit"
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} failed with code ${code}`));
    });
  });

const main = async () => {
  const files = [
    ...(await walk(path.join(projectRoot, "src"))),
    ...(await walk(path.join(projectRoot, "config")))
  ].sort();

  for (const file of files) {
    await run(process.execPath, ["--check", file]);
  }

  await import(pathToFileURL(path.join(projectRoot, "src/app.js")).href);
  console.log("Build check passed");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
