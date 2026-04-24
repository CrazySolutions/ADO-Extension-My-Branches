import { initSDK, getGitClient, getUserEmail } from '../common/sdkClient';
import { filterUserBranches } from '../common/branchService';

async function init(): Promise<void> {
  await initSDK();

  const container = document.getElementById('app');
  if (!container) return;

  container.textContent = 'Loading branches…';

  // TODO: fetch repos across all projects in the org and render branch list
  const _gitClient = getGitClient();
  const _userEmail = getUserEmail();
}

init().catch(console.error);
