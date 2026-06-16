---
name: plan-html-workflow
description: Create durable project plans as standalone HTML files in a repository-local .plans directory, using the postplan CLI for creation, listing, and publishing. Use when Codex needs to create implementation plans, architecture plans, migration plans, design explorations, code review explainers, incident reports, research summaries, interactive tuning artifacts, or any substantial plan that should be browsable locally and publishable to Postplan.
---

# Plan HTML Workflow

Adapted from the MIT-licensed `html-it` skill by RoboNuggets (`https://github.com/robonuggets/html-it`) and from Thariq Shihipar's "Using Claude Code: The unreasonable effectiveness of HTML" article (`https://claude.com/blog/using-claude-code-the-unreasonable-effectiveness-of-html`). This version is narrowed to the Postplan workflow.

## Storage rule

Always put durable plans in the current project's `.plans/` directory.

Use this filename shape:

```txt
.plans/yyyy-mm-dd_snake_case_name.html
```

Do not put the project slug in the local path. The current repository is the local project boundary. Project slugs are used only when publishing.

## Style rule

Plans should look like the Postplan document template:

- dark mode only
- narrow readable body width
- large plain title
- one short summary near the top
- small metadata line
- sections separated by thin dividers
- tables, lists, code blocks, SVG diagrams, and simple controls only when they help understanding
- no decorative cards, pills, glows, gradients, fake app previews, or ornamental labels
- no remote CSS, fonts, scripts, or images unless the user explicitly asks

Use `assets/plan-template.html` as the visual baseline when creating a new plan.

## Content rule

Prefer HTML over Markdown when the output is substantial, visual, comparative, interactive, or meant to be shared. Use HTML to make dense information easier to review.

Use the lowest useful level:

1. Static document: plans, specs, reports, postmortems, PR explainers.
2. Visual artifact: comparison tables, SVG flows, annotated snippets, architecture maps.
3. Interactive artifact: toggles, sliders, filters, editable text, live previews.
4. Throwaway tool: one-off triage boards, config editors, prompt tuners, annotation tools.

For level 3 or 4, include an export action such as `Copy as JSON`, `Copy as prompt`, or `Copy as Markdown` so the user's interaction can feed back into the next agent step.

If the request involves comparing options, tuning assumptions, ranking choices, budgeting, capacity planning, risk scoring, prioritization, thresholds, sliders, or "what if" decisions, treat it as at least level 3. Include a small working interactive section in the HTML plan unless the user explicitly asks for a static document. Examples: sliders that update scenario scores, toggles that filter risks, editable assumptions that update a recommendation, or a copy button that exports the selected assumptions.

Do not merely describe the interactive control that should exist later. For planning artifacts, the HTML file itself should include the lightweight interactive model when it helps the reader reason about the plan.

## Creation workflow

1. Run `postplan init` if `.plans/` does not exist.
2. Create a plan with `postplan new "short plan name"` when a fresh template is useful.
3. Edit the generated HTML directly.
4. Keep the content specific to the work: context, recommendation, implementation steps, risks, verification, and open questions.
5. Add visual structure only when it carries information.
6. Publish the plan with `postplan publish <file>` unless the user explicitly asks for local-only work or publishing fails because the CLI is not configured.
7. Finish by giving the user both links:
   - Local: a Markdown file link to the `.plans/...html` file.
   - Hosted: the URL returned by `postplan publish`.

If publishing fails, do not hide the local plan. Give the local file link, explain the publish failure briefly, and include the command the user can rerun.

Every generated plan should include a small `Plan links` section near the top. The local row should identify the local `.plans/...html` source. The hosted row should contain the hosted URL after publish, or say `pending publish` before publish.

## Publishing workflow

When a plan is created or when the user asks to host, publish, or share a plan:

1. Confirm the plan is in `.plans/`.
2. Confirm the local filename follows `yyyy-mm-dd_snake_case_name.html`.
3. Ensure `.postplan.json` has a project slug, or pass `--project`.
4. Use `https://postplan.johari-dev.com` as the hosted Postplan endpoint unless the user explicitly requests another deployment.
5. Run `postplan publish <file>`.
6. Ensure the local HTML's `Plan links` section includes the returned hosted URL.
7. Give the user both the local file link and the hosted URL.

## Formatting guidance

Use these patterns when they help:

- Tables for command matrices, schema fields, tradeoffs, route maps, and acceptance criteria.
- SVG for workflows, data flow, sequence diagrams, or architecture diagrams.
- Code blocks for APIs, payloads, config, commands, and schema.
- Side-by-side regions only when comparing options.
- Filters or toggles when the reader needs to inspect alternatives.
- Copy buttons when the artifact produces data the agent or user should reuse.

Avoid long walls of prose. If a section is getting dense, turn the detail into a table, diagram, or short list.
