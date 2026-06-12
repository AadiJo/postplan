#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { spawnSync } from "node:child_process";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const cliDir = join(repoRoot, "packages", "postplan-cli");
const skillName = "plan-html-workflow";
const skillSource = join(repoRoot, "skills", skillName);
const codexHome = process.env.CODEX_HOME
  ? resolve(process.env.CODEX_HOME)
  : join(homedir(), ".codex");
const skillTarget = join(codexHome, "skills", skillName);

function fail(message) {
  console.error(`postplan sync failed: ${message}`);
  process.exit(1);
}

function run(command, args, options) {
  const result = spawnSync([command, ...args].join(" "), {
    stdio: "inherit",
    shell: true,
    ...options,
  });

  if (result.error) {
    fail(result.error.message);
  }

  if (result.status !== 0) {
    fail(`${command} ${args.join(" ")} exited with ${result.status}`);
  }
}

if (!existsSync(cliDir)) {
  fail(`missing CLI package at ${cliDir}`);
}

if (!existsSync(skillSource)) {
  fail(`missing skill source at ${skillSource}`);
}

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

console.log("postplan sync: linking CLI");
run(npmCommand, ["link"], { cwd: cliDir });

console.log("postplan sync: installing skill");
mkdirSync(dirname(skillTarget), { recursive: true });
rmSync(skillTarget, { recursive: true, force: true });
cpSync(skillSource, skillTarget, { recursive: true });

console.log("postplan sync: done");
