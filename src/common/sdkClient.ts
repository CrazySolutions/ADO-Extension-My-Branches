import * as SDK from 'azure-devops-extension-sdk';
import { getClient } from 'azure-devops-extension-api';
import { GitRestClient } from 'azure-devops-extension-api/Git';

export async function initSDK(): Promise<void> {
  await SDK.init();
  await SDK.ready();
}

// Returns the user's login name, which is typically their email address.
export function getUserEmail(): string {
  return SDK.getUser().name;
}

export function getGitClient(): GitRestClient {
  return getClient(GitRestClient);
}
