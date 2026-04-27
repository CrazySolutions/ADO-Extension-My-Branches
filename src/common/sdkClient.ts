import * as SDK from 'azure-devops-extension-sdk';
import { getClient } from 'azure-devops-extension-api';
import { GitRestClient } from 'azure-devops-extension-api/Git';
import { CoreRestClient } from 'azure-devops-extension-api/Core';
import type { GitClient, CoreClient } from './gitService';

// azure-devops-extension-api v4.x hardcodes api-version 7.2-preview in every generated
// client method. ADO Server on-prem installations that only support up to 7.1 reject
// those requests. Patching beginRequest lets us keep all of the generated client's URL
// resolution, auth handling, and response parsing while capping the version.
const MAX_API_VERSION = '7.1';

function withMaxApiVersion<T extends object>(client: T): T {
  const c = client as any;
  const original = c.beginRequest.bind(c);
  c.beginRequest = (params: any) => original({ ...params, apiVersion: MAX_API_VERSION });
  return client;
}

export async function initSDK(): Promise<void> {
  await SDK.init();
  await SDK.ready();
}

export function getUserEmail(): string {
  return SDK.getUser().name;
}

export function createAdoGitClient(): GitClient {
  return withMaxApiVersion(getClient(GitRestClient));
}

export function createAdoCoreClient(): CoreClient {
  return withMaxApiVersion(getClient(CoreRestClient));
}
