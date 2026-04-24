import { initSDK, getGitClient, getUserEmail } from '../common/sdkClient';
import { filterUserBranches } from '../common/branchService';

async function init(): Promise<void> {
  await initSDK();

  const container = document.getElementById('app');
  if (!container) return;

  container.textContent = 'Loading branches…';

  // TODO: fetch repos for the current project context and render branch list
  const _gitClient = getGitClient();
  const _userEmail = getUserEmail();
}

init().catch(console.error);
