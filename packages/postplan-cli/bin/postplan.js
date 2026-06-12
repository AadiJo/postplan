#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const VERSION = "0.1.0";
const PLAN_RE = /^(\d{4}-\d{2}-\d{2})_([a-z0-9_]+)\.html$/;
const CONFIG_KEYS = ["project", "endpoint", "token"];
function cwdPath(...parts) {
    return join(process.cwd(), ...parts);
}
function userConfigPath() {
    return join(homedir(), ".postplan", "config.json");
}
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function toConfig(value) {
    if (!isRecord(value))
        return {};
    const config = {};
    for (const key of CONFIG_KEYS) {
        const field = value[key];
        if (typeof field === "string") {
            config[key] = field;
        }
    }
    return config;
}
function readJsonIfExists(path) {
    if (!existsSync(path))
        return {};
    const parsed = JSON.parse(readFileSync(path, "utf8"));
    return toConfig(parsed);
}
function writeJson(path, value) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}
function slugify(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .replace(/_+/g, "_");
}
function today() {
    return new Date().toISOString().slice(0, 10);
}
function parsePlanFilename(path) {
    const filename = path.split(/[\\/]/).pop() ?? "";
    const match = filename.match(PLAN_RE);
    if (!match) {
        throw new Error(`Expected filename like yyyy-mm-dd_snake_case_name.html, got ${filename}`);
    }
    const [, date, localName] = match;
    if (!date || !localName) {
        throw new Error(`Expected filename like yyyy-mm-dd_snake_case_name.html, got ${filename}`);
    }
    return {
        date,
        localName,
        sourceFilename: filename,
    };
}
function planTemplate({ title, localName, date, localPath }) {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(localName)}</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #111212;
      --text: #f2f2f0;
      --muted: #9a9c9b;
      --quiet: #686b6a;
      --line: #2a2c2c;
      --code: #181919;
      --accent: #d7dad8;
    }

    * { box-sizing: border-box; }
    html, body { background: var(--bg); }
    body {
      margin: 0;
      color: var(--text);
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.58;
    }
    main {
      width: min(860px, calc(100% - 44px));
      margin: 0 auto;
      padding: 96px 0 104px;
    }
    header { margin-bottom: 58px; }
    .brand {
      margin: 0 0 28px;
      color: var(--accent);
      font-size: 14px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    h1 {
      max-width: 760px;
      margin: 0;
      font-size: clamp(48px, 8vw, 86px);
      font-weight: 760;
      letter-spacing: -0.075em;
      line-height: 0.94;
    }
    .intro {
      max-width: 690px;
      margin: 28px 0 0;
      color: var(--muted);
      font-size: 18px;
      letter-spacing: -0.01em;
    }
    .meta {
      margin: 18px 0 0;
      color: var(--quiet);
      font-size: 14px;
    }
    section {
      padding: 34px 0;
      border-top: 1px solid var(--line);
    }
    h2 {
      margin: 0 0 16px;
      color: var(--text);
      font-size: 22px;
      font-weight: 720;
      letter-spacing: -0.035em;
      line-height: 1.12;
    }
    p {
      max-width: 720px;
      margin: 0;
      color: var(--muted);
    }
    p + p { margin-top: 12px; }
    ul, ol {
      max-width: 760px;
      margin: 14px 0 0;
      padding-left: 22px;
      color: var(--muted);
    }
    li + li { margin-top: 8px; }
    a { color: var(--text); }
    strong { color: var(--text); font-weight: 700; }
    code {
      border-radius: 5px;
      background: var(--code);
      color: #eeeeec;
      font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
      font-size: 0.9em;
      padding: 0.08em 0.32em;
    }
    pre {
      max-width: 100%;
      overflow-x: auto;
      margin: 16px 0 0;
      padding: 0;
      color: #c9ccca;
      background: transparent;
      font: 14px/1.7 ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
      white-space: pre;
    }
    table {
      width: 100%;
      margin: 18px 0 0;
      border-collapse: collapse;
      color: var(--muted);
      font-size: 15px;
    }
    th, td {
      padding: 11px 0;
      border-top: 1px solid var(--line);
      text-align: left;
      vertical-align: top;
    }
    th { color: var(--text); font-weight: 700; }
    th + th, td + td { padding-left: 28px; }
    @media (max-width: 680px) {
      main { width: min(100% - 30px, 860px); padding: 64px 0 72px; }
      h1 { font-size: 48px; }
      table, tbody, tr, th, td { display: block; }
      th + th, td + td { padding-left: 0; }
      td { border-top: 0; padding-top: 0; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="brand">// postplan</p>
      <h1>${escapeHtml(title)}</h1>
      <p class="intro">Replace this with the short reason this plan exists and the decision it should help make.</p>
      <p class="meta">${escapeHtml(date)} / draft / local .plans html</p>
    </header>

    <section>
      <h2>Plan links</h2>
      <table>
        <tbody>
          <tr>
            <th>Local</th>
            <td data-postplan-local><code>${escapeHtml(localPath)}</code></td>
          </tr>
          <tr>
            <th>Hosted</th>
            <td data-postplan-hosted>pending publish</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2>Context</h2>
      <p>Summarize the current state, constraints, and what prompted the plan.</p>
    </section>

    <section>
      <h2>Recommendation</h2>
      <p>State the proposed direction and why it is the best tradeoff.</p>
    </section>

    <section>
      <h2>Implementation</h2>
      <ul>
        <li>Replace this with the first concrete implementation task.</li>
        <li>Include code snippets, tables, diagrams, or interactive controls only when they make the plan easier to review.</li>
      </ul>
    </section>

    <section>
      <h2>Verification</h2>
      <p>Describe the checks that prove the work is complete.</p>
    </section>
  </main>
</body>
</html>
`;
}
function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}
function injectHostedLink(html, { hostedUrl, localPath }) {
    const hostedCell = `<td data-postplan-hosted><a href="${escapeHtml(hostedUrl)}">${escapeHtml(hostedUrl)}</a></td>`;
    const localCell = `<td data-postplan-local><code>${escapeHtml(localPath)}</code></td>`;
    const linksSection = `

    <section>
      <h2>Plan links</h2>
      <table>
        <tbody>
          <tr>
            <th>Local</th>
            ${localCell}
          </tr>
          <tr>
            <th>Hosted</th>
            ${hostedCell}
          </tr>
        </tbody>
      </table>
    </section>`;
    let next = html;
    if (!/data-postplan-hosted/.test(next) && /<\/header>/.test(next)) {
        next = next.replace(/<\/header>/, `</header>${linksSection}`);
        return next;
    }
    if (/<td data-postplan-local>[\s\S]*?<\/td>/.test(next)) {
        next = next.replace(/<td data-postplan-local>[\s\S]*?<\/td>/, localCell);
    }
    if (/<td data-postplan-hosted>[\s\S]*?<\/td>/.test(next)) {
        next = next.replace(/<td data-postplan-hosted>[\s\S]*?<\/td>/, hostedCell);
    }
    return next;
}
function init() {
    mkdirSync(cwdPath(".plans"), { recursive: true });
    const configPath = cwdPath(".postplan.json");
    if (!existsSync(configPath)) {
        writeJson(configPath, {
            project: slugify(process.cwd().split(/[\\/]/).pop() ?? "project"),
            endpoint: "http://localhost:3000",
        });
    }
    console.log("initialized .plans/ and .postplan.json");
}
function createPlan(args) {
    const title = args.join(" ").trim();
    if (!title)
        throw new Error('Usage: postplan new "plan name"');
    const localName = slugify(title);
    const date = today();
    mkdirSync(cwdPath(".plans"), { recursive: true });
    const filename = `${date}_${localName}.html`;
    const localPath = `.plans/${filename}`;
    const path = cwdPath(".plans", filename);
    if (existsSync(path))
        throw new Error(`Plan already exists: ${path}`);
    writeFileSync(path, planTemplate({ title, localName, date, localPath }));
    console.log(path);
}
function listPlans() {
    const plansDir = cwdPath(".plans");
    if (!existsSync(plansDir)) {
        console.log("No .plans/ directory found.");
        return;
    }
    const plans = readdirSync(plansDir)
        .filter((file) => PLAN_RE.test(file))
        .sort()
        .reverse();
    for (const plan of plans) {
        const parsed = parsePlanFilename(plan);
        console.log(`${parsed.date}  ${parsed.localName}  .plans/${parsed.sourceFilename}`);
    }
}
function readConfig() {
    return {
        ...readJsonIfExists(userConfigPath()),
        ...readJsonIfExists(cwdPath(".postplan.json")),
    };
}
function isConfigKey(key) {
    return CONFIG_KEYS.includes(key);
}
function setConfig([key, ...valueParts]) {
    const value = valueParts.join(" ").trim();
    if (!key || !value)
        throw new Error("Usage: postplan config set <project|endpoint|token> <value>");
    if (!isConfigKey(key)) {
        throw new Error("Config key must be project, endpoint, or token");
    }
    if (key === "token") {
        const config = readJsonIfExists(userConfigPath());
        config.token = value;
        writeJson(userConfigPath(), config);
        console.log(`saved token to ${userConfigPath()}`);
        return;
    }
    const configPath = cwdPath(".postplan.json");
    const config = readJsonIfExists(configPath);
    config[key] = value;
    writeJson(configPath, config);
    console.log(`saved ${key} to ${configPath}`);
}
function getOption(args, name) {
    const index = args.indexOf(name);
    if (index === -1)
        return undefined;
    const value = args[index + 1];
    if (!value || value.startsWith("--"))
        throw new Error(`${name} requires a value`);
    args.splice(index, 2);
    return value;
}
async function readResponseJson(response) {
    try {
        return await response.json();
    }
    catch {
        return {};
    }
}
function getErrorMessage(body, fallback) {
    if (isRecord(body) && typeof body.error === "string") {
        return body.error;
    }
    return fallback;
}
function getPublishedUrl(body) {
    if (isRecord(body) && typeof body.url === "string") {
        return body.url;
    }
    throw new Error("Publish response did not include a url");
}
async function publish(args) {
    const projectFlag = getOption(args, "--project");
    const endpointFlag = getOption(args, "--endpoint");
    const tokenFlag = getOption(args, "--token");
    const [fileArg] = args;
    if (!fileArg)
        throw new Error("Usage: postplan publish <file> [--project slug] [--endpoint url]");
    const filePath = resolve(fileArg);
    if (!existsSync(filePath))
        throw new Error(`File not found: ${filePath}`);
    const parsed = parsePlanFilename(filePath);
    let html = readFileSync(filePath, "utf8");
    const config = readConfig();
    const projectSlug = projectFlag ?? config.project;
    const endpoint = endpointFlag ?? config.endpoint;
    const token = tokenFlag ?? process.env.POSTPLAN_TOKEN ?? config.token;
    if (!projectSlug)
        throw new Error("No project slug configured. Run postplan config set project <slug>.");
    if (!endpoint)
        throw new Error("No endpoint configured. Run postplan config set endpoint <url>.");
    const publishEndpoint = endpoint;
    const publishProjectSlug = projectSlug;
    async function sendPublish(currentHtml) {
        const contentHash = `sha256:${createHash("sha256").update(currentHtml).digest("hex")}`;
        const response = await fetch(`${publishEndpoint.replace(/\/$/, "")}/api/publish`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                ...(token ? { authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
                projectSlug: publishProjectSlug,
                ...parsed,
                title: parsed.localName.replaceAll("_", " "),
                html: currentHtml,
                contentHash,
            }),
        });
        const body = await readResponseJson(response);
        if (!response.ok) {
            throw new Error(getErrorMessage(body, `Publish failed with HTTP ${response.status}`));
        }
        return getPublishedUrl(body);
    }
    let hostedUrl = await sendPublish(html);
    const linkedHtml = injectHostedLink(html, {
        hostedUrl,
        localPath: `.plans/${parsed.sourceFilename}`,
    });
    if (linkedHtml !== html) {
        writeFileSync(filePath, linkedHtml);
        html = linkedHtml;
        hostedUrl = await sendPublish(html);
    }
    console.log(hostedUrl);
}
function help() {
    console.log(`postplan ${VERSION}

Usage:
  postplan init
  postplan new "plan name"
  postplan list
  postplan config set <project|endpoint|token> <value>
  postplan publish <file> [--project slug] [--endpoint url]
`);
}
async function main() {
    const [command, ...args] = process.argv.slice(2);
    try {
        if (!command || command === "--help" || command === "-h") {
            help();
            return;
        }
        if (command === "--version" || command === "-v") {
            console.log(VERSION);
            return;
        }
        if (command === "init") {
            init();
            return;
        }
        if (command === "new") {
            createPlan(args);
            return;
        }
        if (command === "list") {
            listPlans();
            return;
        }
        if (command === "config" && args[0] === "set") {
            setConfig(args.slice(1));
            return;
        }
        if (command === "publish") {
            await publish(args);
            return;
        }
        throw new Error(`Unknown command: ${command}`);
    }
    catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
        process.exitCode = 1;
    }
}
main();
// Keep the file URL binding live for Windows npm link shims.
fileURLToPath(import.meta.url);
