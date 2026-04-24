import {
  filterUserBranches,
  isBranchOwnedByUser,
  toBranchInfo,
  shortBranchName,
  BranchRef,
  Repository,
} from '../../src/common/branchService';

const repo: Repository = { id: 'repo-1', name: 'my-repo' };

function makeBranch(refName: string, uniqueName: string, displayName = 'Test User'): BranchRef {
  return {
    name: refName,
    creator: { uniqueName, displayName },
  };
}

describe('shortBranchName', () => {
  it('strips refs/heads/ prefix', () => {
    expect(shortBranchName('refs/heads/feature/my-branch')).toBe('feature/my-branch');
  });

  it('leaves names without the prefix unchanged', () => {
    expect(shortBranchName('main')).toBe('main');
  });
});

describe('isBranchOwnedByUser', () => {
  it('returns true when creator uniqueName matches', () => {
    const branch = makeBranch('refs/heads/feature/x', 'user@example.com');
    expect(isBranchOwnedByUser(branch, 'user@example.com')).toBe(true);
  });

  it('is case-insensitive', () => {
    const branch = makeBranch('refs/heads/feature/x', 'User@Example.COM');
    expect(isBranchOwnedByUser(branch, 'user@example.com')).toBe(true);
  });

  it('returns false when creator uniqueName does not match', () => {
    const branch = makeBranch('refs/heads/feature/x', 'other@example.com');
    expect(isBranchOwnedByUser(branch, 'user@example.com')).toBe(false);
  });
});

describe('toBranchInfo', () => {
  it('maps a BranchRef to BranchInfo correctly', () => {
    const branch = makeBranch('refs/heads/feature/x', 'user@example.com', 'Alice');
    const result = toBranchInfo(branch, repo, 'my-project');

    expect(result).toEqual({
      name: 'feature/x',
      repositoryId: 'repo-1',
      repositoryName: 'my-repo',
      projectName: 'my-project',
      creatorDisplayName: 'Alice',
    });
  });
});

describe('filterUserBranches', () => {
  const userEmail = 'user@example.com';
  const branches: BranchRef[] = [
    makeBranch('refs/heads/feature/mine', userEmail),
    makeBranch('refs/heads/feature/theirs', 'other@example.com'),
    makeBranch('refs/heads/bugfix/mine-too', userEmail),
  ];

  it('returns only branches created by the given user', () => {
    const result = filterUserBranches(branches, repo, 'project', userEmail);

    expect(result).toHaveLength(2);
    expect(result.map(b => b.name)).toEqual(['feature/mine', 'bugfix/mine-too']);
  });

  it('returns empty array when no branches match', () => {
    expect(filterUserBranches(branches, repo, 'project', 'nobody@example.com')).toHaveLength(0);
  });

  it('returns empty array for empty input', () => {
    expect(filterUserBranches([], repo, 'project', userEmail)).toHaveLength(0);
  });

  it('attaches repository and project metadata to each result', () => {
    const result = filterUserBranches(
      [makeBranch('refs/heads/main', userEmail)],
      repo,
      'alpha-project',
      userEmail
    );

    expect(result[0].repositoryId).toBe('repo-1');
    expect(result[0].repositoryName).toBe('my-repo');
    expect(result[0].projectName).toBe('alpha-project');
  });
});
