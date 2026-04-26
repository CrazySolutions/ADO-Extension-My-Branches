import * as SDK from 'azure-devops-extension-sdk';
import { getClient } from 'azure-devops-extension-api';
import { GitRestClient } from 'azure-devops-extension-api/Git';
import type { ILocationService, IHostNavigationService } from 'azure-devops-extension-api/Common/CommonServices';
import { getUserBranchesInProject, BranchDetail } from '../common/gitService';
import { formatTimeAgo, isStale } from '../common/branchService';
import { escapeHtml, attachRowClickHandlers } from '../common/domUtils';
import { branchUrl, repoBranchesUrl } from '../common/urlUtils';
import '../common/styles.css';

function renderTable(branches: BranchDetail[], collectionUri: string): string {
  const now = new Date();

  const rows = branches
    .sort((a, b) => (b.lastCommitDate?.getTime() ?? 0) - (a.lastCommitDate?.getTime() ?? 0))
    .map(b => {
      const stale = isStale(b.lastCommitDate, now);
      const updated = b.lastCommitDate ? formatTimeAgo(b.lastCommitDate, now) : '—';
      const rowHref = branchUrl(collectionUri, b.projectName, b.repositoryName, b.name);
      const repoHref = repoBranchesUrl(collectionUri, b.projectName, b.repositoryName);
      return `
        <tr class="mb-clickable-row" data-href="${escapeHtml(rowHref)}">
          <td><a class="mb-branch-name" href="${escapeHtml(rowHref)}" target="_top">${escapeHtml(b.name)}</a></td>
          <td><a class="mb-cell-link" href="${escapeHtml(repoHref)}" target="_top">${escapeHtml(b.repositoryName)}</a></td>
          <td class="${stale ? 'mb-stale' : ''}">${escapeHtml(updated)}</td>
        </tr>`;
    })
    .join('');

  return `
    <div class="mb-header">
      <h1>My Branches</h1>
      <span class="mb-count">${branches.length}</span>
    </div>
    <table class="mb-table">
      <thead>
        <tr>
          <th>Branch</th>
          <th>Repository</th>
          <th>Last updated</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

async function init(): Promise<void> {
  await SDK.init();
  await SDK.ready();

  const container = document.getElementById('app')!;
  container.innerHTML = '<div class="mb-loading">Loading your branches…</div>';

  try {
    const user = SDK.getUser();
    const pageContext = SDK.getPageContext();
    const projectName = pageContext.webContext.project?.name;

    if (!projectName) {
      container.innerHTML = '<div class="mb-error">Could not determine the current project.</div>';
      return;
    }

    const locationService = await SDK.getService<ILocationService>('ms.vss-features.location-service');
    const collectionUri = await locationService.getServiceLocation();
    const gitClient = getClient(GitRestClient);
    const branches = await getUserBranchesInProject(gitClient, projectName, user.name);

    if (branches.length === 0) {
      container.innerHTML = '<div class="mb-empty">You have no branches in this project.</div>';
    } else {
      container.innerHTML = renderTable(branches, collectionUri);
      const navigationService = await SDK.getService<IHostNavigationService>('ms.vss-features.host-navigation-service');
      attachRowClickHandlers(container, url => navigationService.navigate(url));
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    container.innerHTML = `<div class="mb-error">Failed to load branches: ${escapeHtml(message)}</div>`;
  }
}

init().catch(console.error);
