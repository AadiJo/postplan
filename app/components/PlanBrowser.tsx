"use client";

import { useMemo, useState } from "react";

export type PublishedPlan = {
  publicId: string;
  projectSlug: string;
  localName: string;
  title?: string;
  date: string;
  sourceFilename: string;
  updatedAt: number;
};

export type ProjectGroup = {
  slug: string;
  displayName?: string;
  updatedAt: number;
  plans: PublishedPlan[];
};

export function PlanBrowser({ projects }: { projects: ProjectGroup[] }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();

  const filteredProjects = useMemo(() => {
    if (!normalized) return projects;

    return projects
      .map((project) => {
        const projectMatches = project.slug.toLowerCase().includes(normalized);
        const plans = project.plans.filter((plan) => {
          return (
            projectMatches ||
            plan.localName.toLowerCase().includes(normalized) ||
            plan.date.includes(normalized)
          );
        });
        return { ...project, plans };
      })
      .filter((project) => project.plans.length > 0);
  }, [normalized, projects]);

  return (
    <>
      <div className="toolbar">
        <input
          className="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="filter projects or plans"
          aria-label="Filter projects or plans"
        />
      </div>

      {filteredProjects.length === 0 ? (
        <p className="empty">No published plans match this view.</p>
      ) : (
        <div className="project-list">
          {filteredProjects.map((project, index) => (
            <details key={project.slug} open={index < 3 || Boolean(normalized)}>
              <summary>
                <span className="project-name">{project.displayName ?? project.slug}</span>
                <span className="project-count">{project.plans.length} plans</span>
              </summary>
              <ul className="plan-list">
                {project.plans.map((plan) => (
                  <li className="plan-row" key={plan.publicId}>
                    <span className="plan-date">{plan.date}</span>
                    <a className="plan-name" href={`/${plan.publicId}`}>
                      {plan.localName}
                    </a>
                    <span className="plan-id">{plan.publicId.slice(0, 8)}</span>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      )}
    </>
  );
}
