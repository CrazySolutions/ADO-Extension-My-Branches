export interface IdentityRef {
  uniqueName: string;
  displayName: string;
}

// Matches the GitRef shape returned by GET .../refs?filter=heads/
export interface BranchRef {
  name: string;       // full ref name, e.g. refs/heads/feature/x
  creator: IdentityRef;
}

export interface Repository {
  id: string;
  name: string;
}

export interface BranchInfo {
  name: string;
  repositoryId: string;
  repositoryName: string;
  projectName: string;
  creatorDisplayName: string;
}

export function shortBranchName(refName: string): string {
  return refName.replace(/^refs\/heads\//, '');
}

export function isBranchOwnedByUser(branch: BranchRef, userUniqueName: string): boolean {
  return branch.creator.uniqueName.toLowerCase() === userUniqueName.toLowerCase();
}

export function toBranchInfo(branch: BranchRef, repository: Repository, projectName: string): BranchInfo {
  return {
    name: shortBranchName(branch.name),
    repositoryId: repository.id,
    repositoryName: repository.name,
    projectName,
    creatorDisplayName: branch.creator.displayName,
  };
}

export function filterUserBranches(
  branches: BranchRef[],
  repository: Repository,
  projectName: string,
  userUniqueName: string
): BranchInfo[] {
  return branches
    .filter(b => isBranchOwnedByUser(b, userUniqueName))
    .map(b => toBranchInfo(b, repository, projectName));
}
