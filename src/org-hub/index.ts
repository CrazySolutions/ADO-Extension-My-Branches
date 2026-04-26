import * as SDK from 'azure-devops-extension-sdk';
import { getClient } from 'azure-devops-extension-api';
import { GitRestClient } from 'azure-devops-extension-api/Git';
import { CoreRestClient } from 'azure-devops-extension-api/Core';
import type { ILocationService, IHostNavigationService } from 'azure-devops-extension-api/Common/CommonServices';
import { getUserBranchesAcrossOrg, BranchDetail } from '../common/gitService';
import { formatTimeAgo, isStale } from '../common/branchService';
import { escapeHtml, attachRowClickHandlers } from '../common/domUtils';
import { branchUrl, repoBranchesUrl, projectUrl } from '../common/urlUtils';
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
      const projHref = projectUrl(collectionUri, b.projectName);
      return `
        <tr class="mb-clickable-row" data-href="${escapeHtml(rowHref)}">
          <td><a class="mb-branch-name" href="${escapeHtml(rowHref)}" target="_top">${escapeHtml(b.name)}</a></td>
          <td><a class="mb-cell-link" href="${escapeHtml(repoHref)}" target="_top">${escapeHtml(b.repositoryName)}</a></td>
          <td><a class="mb-cell-link" href="${escapeHtml(projHref)}" target="_top">${escapeHtml(b.projectName)}</a></td>
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
          <th>Project</th>
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
    const locationService = await SDK.getService<ILocationService>('ms.vss-features.location-service');
    const collectionUri = await locationService.getServiceLocation();
    const gitClient = getClient(GitRestClient);
    const coreClient = getClient(CoreRestClient);

    const branches = await getUserBranchesAcrossOrg(gitClient, coreClient, user.name);

    if (branches.length === 0) {
      container.innerHTML = '<div class="mb-empty">You have no branches across this organisation.</div>';
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
