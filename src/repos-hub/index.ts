import * as SDK from 'azure-devops-extension-sdk';
import type { ILocationService, IHostNavigationService, IProjectPageService } from 'azure-devops-extension-api/Common/CommonServices';
import { createAdoGitClient } from '../common/sdkClient';
import { getUserBranchesInProject, BranchDetail } from '../common/gitService';
import { formatTimeAgo, isStale, sortBranches, filterBranches, SortColumn, SortDirection } from '../common/branchService';
import { escapeHtml, attachRowClickHandlers } from '../common/domUtils';
import { branchUrl, repoBranchesUrl } from '../common/urlUtils';
import '../common/styles.css';

interface SortState {
  column: SortColumn;
  direction: SortDirection;
}

function sortableHeader(label: string, column: SortColumn, sort: SortState): string {
  const sortAttr = sort.column === column ? sort.direction : '';
  return `<th class="mb-sortable" data-column="${column}" data-sort="${sortAttr}">${label}</th>`;
}

function renderRows(branches: BranchDetail[], collectionUri: string, filterPattern: string): string {
  if (branches.length === 0) {
    const msg = filterPattern
      ? `No branches match "${escapeHtml(filterPattern)}"`
      : 'No branches to display.';
    return `<tr><td colspan="3" class="mb-no-results">${msg}</td></tr>`;
  }
  const now = new Date();
  return branches.map(b => {
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
  }).join('');
}

function countLabel(filtered: number, total: number, filterPattern: string): string {
  return filterPattern && filtered !== total ? `${filtered} of ${total}` : String(filtered);
}

function renderTable(
  branches: BranchDetail[],
  totalCount: number,
  collectionUri: string,
  sort: SortState,
  filterPattern: string
): string {
  return `
    <div class="mb-header">
      <h1>My Branches</h1>
      <span class="mb-count">${countLabel(branches.length, totalCount, filterPattern)}</span>
    </div>
    <input class="mb-filter-input" type="text" placeholder="Filter branches… (* = wildcard)" value="${escapeHtml(filterPattern)}" aria-label="Filter branches">
    <table class="mb-table">
      <thead>
        <tr>
          ${sortableHeader('Branch', 'name', sort)}
          ${sortableHeader('Repository', 'repositoryName', sort)}
          ${sortableHeader('Last updated', 'lastCommitDate', sort)}
        </tr>
      </thead>
      <tbody>${renderRows(branches, collectionUri, filterPattern)}</tbody>
    </table>`;
}

async function init(): Promise<void> {
  await SDK.init();
  await SDK.ready();

  const container = document.getElementById('app')!;
  container.innerHTML = '<div class="mb-loading">Loading your branches…</div>';

  try {
    const user = SDK.getUser();
    const projectService = await SDK.getService<IProjectPageService>('ms.vss-tfs-web.tfs-page-data-service');
    const project = await projectService.getProject();
    const projectName = project?.name;

    if (!projectName) {
      container.innerHTML = '<div class="mb-error">Could not determine the current project.</div>';
      return;
    }

    const locationService = await SDK.getService<ILocationService>('ms.vss-features.location-service');
    const collectionUri = await locationService.getServiceLocation();
    const gitClient = createAdoGitClient();
    const branches = await getUserBranchesInProject(gitClient, projectName, user.name);

    if (branches.length === 0) {
      container.innerHTML = '<div class="mb-empty">You have no branches in this project.</div>';
      return;
    }

    const navigationService = await SDK.getService<IHostNavigationService>('ms.vss-features.host-navigation-service');
    const sort: SortState = { column: 'lastCommitDate', direction: 'asc' };
    let filterPattern = '';

    function applyAndRenderRows(): void {
      const filtered = filterBranches(branches, filterPattern);
      const sorted = sortBranches(filtered, sort.column, sort.direction);
      container.querySelector('tbody')!.innerHTML = renderRows(sorted, collectionUri, filterPattern);
      container.querySelector('.mb-count')!.textContent = countLabel(sorted.length, branches.length, filterPattern);
      attachRowClickHandlers(container, url => navigationService.navigate(url));
    }

    function render(): void {
      const filtered = filterBranches(branches, filterPattern);
      const sorted = sortBranches(filtered, sort.column, sort.direction);
      container.innerHTML = renderTable(sorted, branches.length, collectionUri, sort, filterPattern);
      attachRowClickHandlers(container, url => navigationService.navigate(url));

      container.querySelector<HTMLInputElement>('.mb-filter-input')!
        .addEventListener('input', e => {
          filterPattern = (e.target as HTMLInputElement).value;
          applyAndRenderRows();
        });

      container.querySelectorAll<HTMLElement>('.mb-sortable').forEach(th => {
        th.addEventListener('click', () => {
          const column = th.dataset.column as SortColumn;
          sort.direction = sort.column === column && sort.direction === 'asc' ? 'desc' : 'asc';
          sort.column = column;
          render();
        });
      });
    }

    render();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    container.innerHTML = `<div class="mb-error">Failed to load branches: ${escapeHtml(message)}</div>`;
  }
}

init().catch(console.error);
