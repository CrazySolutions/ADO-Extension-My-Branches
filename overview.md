# My Branches

Quickly find the branches you created — without scrolling through every branch in the repository.

## Features

- **Organisation view** — a dedicated tab on the organisation/collection start page lists all your branches across every project and repository you have access to.
- **Repository view** — a dedicated tab under Repos inside each project lists your branches for that project only, giving you the focused context you need while working.
- **Accurate ownership** — branch ownership is based on who pushed the branch into existence, not who made the latest commit.
- **Cloud and on-premises** — works with both Azure DevOps Services and Azure DevOps Server.

## How it works

The extension uses your current session token to identify you. It queries the Git refs API and filters branches where the `creator` field matches your identity — no extra permissions or configuration required beyond the default `Code (read)` scope.

## Where it appears

| Location | What you see |
|---|---|
| Organisation / collection start page | All your branches across all projects |
| Repos → My Branches (inside a project) | Your branches within that project |

## Getting started

Install the extension from the marketplace and navigate to your organisation start page or to Repos inside any project. The **My Branches** tab will appear automatically.

No configuration is needed.

## Feedback and issues

Found a bug or have a suggestion? Open an issue on [GitHub](https://github.com/Zezeq/ADO-Extension-My-Branches/issues).
