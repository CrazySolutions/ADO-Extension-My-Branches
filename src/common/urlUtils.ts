export function branchUrl(
  collectionUri: string,
  projectName: string,
  repoName: string,
  branchName: string
): string {
  const base = collectionUri.replace(/\/$/, '');
  return `${base}/${encodeURIComponent(projectName)}/_git/${encodeURIComponent(repoName)}?version=GB${encodeURIComponent(branchName)}`;
}

export function repoBranchesUrl(
  collectionUri: string,
  projectName: string,
  repoName: string
): string {
  const base = collectionUri.replace(/\/$/, '');
  return `${base}/${encodeURIComponent(projectName)}/_git/${encodeURIComponent(repoName)}/branches`;
}

export function projectUrl(collectionUri: string, projectName: string): string {
  const base = collectionUri.replace(/\/$/, '');
  return `${base}/${encodeURIComponent(projectName)}`;
}
