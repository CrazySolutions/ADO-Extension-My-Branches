import { shortBranchName } from './branchService';

export interface GitRef {
  name: string;
  objectId: string;
  creator?: { uniqueName?: string };
}

export interface GitClient {
  getRefs(repoId: string, project: string, filter: string): Promise<GitRef[]>;
  getCommit(commitId: string, repoId: string, project: string): Promise<{ author?: { date?: Date } }>;
  getRepositories(project: string): Promise<Array<{ id?: string; name?: string }>>;
}

export interface CoreClient {
  getProjects(): Promise<Array<{ name?: string }>>;
}

export interface BranchDetail {
  name: string;
  repositoryId: string;
  repositoryName: string;
  projectName: string;
  lastCommitDate: Date | undefined;
}

async function getUserRefsInRepo(
  gitClient: GitClient,
  repoId: string,
  projectName: string,
  userUniqueName: string
): Promise<GitRef[]> {
  const refs = await gitClient.getRefs(repoId, projectName, 'heads/');
  return refs.filter(
    ref => ref.creator?.uniqueName?.toLowerCase() === userUniqueName.toLowerCase()
  );
}

async function getCommitDate(
  gitClient: GitClient,
  objectId: string,
  repoId: string,
  projectName: string
): Promise<Date | undefined> {
  try {
    const commit = await gitClient.getCommit(objectId, repoId, projectName);
    return commit.author?.date;
  } catch {
    return undefined;
  }
}

export async function getUserBranchesInRepo(
  gitClient: GitClient,
  repoId: string,
  repoName: string,
  projectName: string,
  userUniqueName: string
): Promise<BranchDetail[]> {
  const userRefs = await getUserRefsInRepo(gitClient, repoId, projectName, userUniqueName);

  return Promise.all(
    userRefs.map(async ref => ({
      name: shortBranchName(ref.name),
      repositoryId: repoId,
      repositoryName: repoName,
      projectName,
      lastCommitDate: await getCommitDate(gitClient, ref.objectId, repoId, projectName),
    }))
  );
}

export async function getUserBranchesInProject(
  gitClient: GitClient,
  projectName: string,
  userUniqueName: string
): Promise<BranchDetail[]> {
  const repos = await gitClient.getRepositories(projectName);
  const results = await Promise.all(
    repos
      .filter((repo): repo is { id: string; name: string } => Boolean(repo.id && repo.name))
      .map(repo => getUserBranchesInRepo(gitClient, repo.id, repo.name, projectName, userUniqueName).catch(() => [] as BranchDetail[]))
  );
  return results.flat();
}

export async function getUserBranchesAcrossOrg(
  gitClient: GitClient,
  coreClient: CoreClient,
  userUniqueName: string
): Promise<BranchDetail[]> {
  const projects = await coreClient.getProjects();
  const results = await Promise.all(
    projects
      .filter((project): project is { name: string } => Boolean(project.name))
      .map(project => getUserBranchesInProject(gitClient, project.name, userUniqueName).catch(() => [] as BranchDetail[]))
  );
  return results.flat();
}
