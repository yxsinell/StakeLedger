#!/usr/bin/env bun

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';

interface JiraConfig {
  baseUrl: string
  email: string
  apiToken: string
  projectKey: string
}

interface JiraIssue {
  fields: {
    project: {
      key: string
    }
  }
}

interface JiraSprint {
  state: string
}

interface SprintArgs {
  sprintId: number
  issueKeys: string[]
}

function printHelp(): void {
  console.log(`Usage: bun run jira:sprint:add -- --sprint <id> --issues <KEY-1,KEY-2>

Moves existing Jira issues into a future or active sprint after validating they
belong to this repository's configured Jira project.

Required environment variables:
  ATLASSIAN_URL
  ATLASSIAN_EMAIL
  ATLASSIAN_API_TOKEN

Optional environment variables:
  JIRA_PROJECT   Overrides .agents/project.yaml project.project_key
`);
}

function parseArgs(args: string[]): SprintArgs {
  let sprintValue: string | undefined;
  let issuesValue: string | undefined;

  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    const next = args[index + 1];

    if (arg === '--sprint') {
      sprintValue = next;
      index++;
    }
    else if (arg === '--issues') {
      issuesValue = next;
      index++;
    }
  }

  const sprintId = Number.parseInt(sprintValue ?? '', 10);
  const issueKeys = Array.from(new Set(
    (issuesValue ?? '')
      .split(/[\s,]+/)
      .map(key => key.trim().toUpperCase())
      .filter(Boolean),
  ));

  if (!Number.isSafeInteger(sprintId) || sprintId <= 0) {
    throw new Error('A positive --sprint ID is required.');
  }
  if (issueKeys.length === 0 || issueKeys.length > 50) {
    throw new Error('--issues must contain between 1 and 50 comma-separated issue keys.');
  }
  if (issueKeys.some(key => !/^[A-Z][A-Z0-9]*-\d+$/.test(key))) {
    throw new Error('--issues contains an invalid Jira issue key.');
  }

  return { sprintId, issueKeys };
}

function loadProjectKey(): string {
  if (process.env.JIRA_PROJECT) {
    return process.env.JIRA_PROJECT;
  }

  const projectPath = join(import.meta.dir, '..', '.agents', 'project.yaml');
  if (!existsSync(projectPath)) {
    throw new Error('Missing .agents/project.yaml. Set JIRA_PROJECT explicitly.');
  }

  const parsed = parseYaml(readFileSync(projectPath, 'utf8')) as {
    project?: { project_key?: unknown }
  };
  const projectKey = parsed.project?.project_key;
  if (typeof projectKey !== 'string' || !projectKey) {
    throw new Error('Missing project.project_key in .agents/project.yaml.');
  }

  return projectKey;
}

function loadConfig(): JiraConfig {
  const baseUrl = process.env.ATLASSIAN_URL;
  const email = process.env.ATLASSIAN_EMAIL;
  const apiToken = process.env.ATLASSIAN_API_TOKEN;
  const missing = [
    !baseUrl && 'ATLASSIAN_URL',
    !email && 'ATLASSIAN_EMAIL',
    !apiToken && 'ATLASSIAN_API_TOKEN',
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    baseUrl: baseUrl!.replace(/\/$/, ''),
    email: email!,
    apiToken: apiToken!,
    projectKey: loadProjectKey(),
  };
}

async function jiraFetch<T>(
  config: JiraConfig,
  endpoint: string,
  options: RequestInit = {},
): Promise<T | null> {
  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');
  const response = await fetch(`${config.baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.text()).slice(0, 500);
    throw new Error(`Jira API error: ${response.status} ${response.statusText} - ${body}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json() as Promise<T>;
}

async function addIssuesToSprint(config: JiraConfig, args: SprintArgs): Promise<void> {
  const sprint = await jiraFetch<JiraSprint>(config, `/rest/agile/1.0/sprint/${args.sprintId}`);
  if (!sprint || !['future', 'active'].includes(sprint.state)) {
    throw new Error(`Sprint ${args.sprintId} is not future or active.`);
  }

  for (const issueKey of args.issueKeys) {
    const issue = await jiraFetch<JiraIssue>(config, `/rest/api/3/issue/${issueKey}?fields=project`);
    if (issue?.fields.project.key !== config.projectKey) {
      throw new Error(`${issueKey} does not belong to Jira project ${config.projectKey}.`);
    }
  }

  await jiraFetch<never>(config, `/rest/agile/1.0/sprint/${args.sprintId}/issue`, {
    method: 'POST',
    body: JSON.stringify({ issues: args.issueKeys }),
  });

  console.log(JSON.stringify({
    sprint_id: args.sprintId,
    issues: args.issueKeys,
    project: config.projectKey,
    status: 'assigned',
  }, null, 2));
}

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);
  if (command !== 'add' || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(command === 'add' ? 0 : 1);
  }

  const parsedArgs = parseArgs(args);
  await addIssuesToSprint(loadConfig(), parsedArgs);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
