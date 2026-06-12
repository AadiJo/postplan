# postplan

Postplan is a local-first workflow for durable agent plans. Agents write standalone HTML plans into a project-local `.plans/` directory, then publish selected plans to a small hosted browser backed by Convex and deployed on Vercel.

## What it includes

- A Next.js app for browsing published plans by project.
- Convex tables and functions for projects, plans, and stable direct plan routes.
- A local global CLI named `postplan`.
- A Codex skill named `plan-html-workflow`.
- A dark HTML plan template shared by the CLI and skill.

## Local plan convention

Plans live directly under `.plans/` in each project:

```txt
.plans/
  2026-06-12_agent_plan_hosting_workflow.html
  2026-06-12_scenario_comparison_feature.html
```

Local files do not include the project slug in their path. The project slug is only used when publishing.

## Setup

Install dependencies:

```bash
npm install
```

Run the local app:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Run Convex development sync:

```bash
npx convex dev
```

## CLI

The CLI source is in:

```txt
packages/postplan-cli
```

Install it globally from local source on Windows:

```bash
cd packages/postplan-cli
npm link
postplan --version
```

Install it globally from WSL:

```bash
cd /path/to/postplan/packages/postplan-cli
npm link
postplan --version
```

Common commands:

```bash
postplan init
postplan new "database migration plan"
postplan list
postplan config set project postplan
postplan config set endpoint <your-postplan-url>
postplan publish .plans/2026-06-12_agent_plan_hosting_workflow.html
```

`postplan publish` updates the local HTML with both links:

- the local `.plans/...html` path
- the hosted `/[id]` URL

It then republishes the updated HTML so the hosted copy contains the same link section.

## Configuration

Project-level config lives in `.postplan.json`:

```json
{
  "project": "postplan",
  "endpoint": "http://localhost:3000"
}
```

User-level private config lives outside the repo:

```txt
~/.postplan/config.json
```

Use it for the publish token:

```bash
postplan config set token <token>
```

## Hosted routes

The hosted browser has two route shapes:

```txt
/
/[id]
```

`/` shows project slug groups and plan rows.

`/[id]` renders the stored plan HTML directly using the opaque Convex document id.

## Convex

Deploy functions:

```bash
npx convex deploy -y
```

## Vercel

Deploy:

```bash
vercel deploy --prod --yes
```

Required production environment variables:

```txt
NEXT_PUBLIC_CONVEX_URL
POSTPLAN_PUBLISH_TOKEN
```

Use `.env.example` as the public template for local environment variables. Keep real deployment URLs and tokens in `.env.local`, Vercel project environment variables, or user-level CLI config.

## Codex skill

The repo copy of the skill is:

```txt
skills/plan-html-workflow
```

The installed Codex copy is:

```txt
$CODEX_HOME/skills/plan-html-workflow
```

If `CODEX_HOME` is not set, use the default Codex skills directory for your OS.

The skill tells agents to:

- create durable plans in `.plans/`
- use standalone dark HTML
- use the Postplan visual template
- include interactive controls when the plan benefits from comparison, scoring, tuning, or prioritization
- publish plans with `postplan publish`
- return both the local and hosted links

Validate the skill:

```bash
python <codex-home>/skills/.system/skill-creator/scripts/quick_validate.py skills/plan-html-workflow
python <codex-home>/skills/.system/skill-creator/scripts/quick_validate.py <codex-home>/skills/plan-html-workflow
```

Sync the repo copy into the installed Codex skill:

```powershell
Copy-Item -Recurse -Force .\skills\plan-html-workflow\* <codex-home>\skills\plan-html-workflow\
```

Or use the project sync script:

```bash
npm run sync:installed
```

## Git hook

Postplan includes a pre-commit hook that runs the sync script before each commit. It refreshes the globally linked CLI and copies the repo skill into the installed Codex skill directory.

Enable it after the project is initialized as a Git repo:

```bash
npm run hooks:install
```

The hook runs:

```bash
node scripts/sync-installed.mjs
```

## Notes

`.plans/` is ignored by default so local planning artifacts do not become normal source changes and hosted plan URLs do not leak into public source.

`README.md` is also ignored by default in this workspace because documentation files are configured to be ignored.
