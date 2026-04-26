import { branchUrl, repoBranchesUrl, projectUrl } from '../../src/common/urlUtils';

const BASE_WITH_SLASH = 'https://dev.azure.com/myorg/';
const BASE_WITHOUT_SLASH = 'https://dev.azure.com/myorg';

describe('branchUrl', () => {
  it('builds a branch URL with GB version param', () => {
    expect(branchUrl(BASE_WITH_SLASH, 'MyProject', 'my-repo', 'main')).toBe(
      'https://dev.azure.com/myorg/MyProject/_git/my-repo?version=GBmain'
    );
  });

  it('encodes slashes in branch names', () => {
    expect(branchUrl(BASE_WITH_SLASH, 'MyProject', 'my-repo', 'feature/my-branch')).toBe(
      'https://dev.azure.com/myorg/MyProject/_git/my-repo?version=GBfeature%2Fmy-branch'
    );
  });

  it('encodes spaces in project and repo names', () => {
    expect(branchUrl(BASE_WITH_SLASH, 'My Project', 'my repo', 'main')).toBe(
      'https://dev.azure.com/myorg/My%20Project/_git/my%20repo?version=GBmain'
    );
  });

  it('handles collection URI without trailing slash', () => {
    expect(branchUrl(BASE_WITHOUT_SLASH, 'MyProject', 'my-repo', 'main')).toBe(
      'https://dev.azure.com/myorg/MyProject/_git/my-repo?version=GBmain'
    );
  });

  it('handles on-prem collection URI', () => {
    expect(branchUrl('https://server/tfs/DefaultCollection/', 'Proj', 'Repo', 'dev')).toBe(
      'https://server/tfs/DefaultCollection/Proj/_git/Repo?version=GBdev'
    );
  });
});

describe('repoBranchesUrl', () => {
  it('builds the branches page URL for a repository', () => {
    expect(repoBranchesUrl(BASE_WITH_SLASH, 'MyProject', 'my-repo')).toBe(
      'https://dev.azure.com/myorg/MyProject/_git/my-repo/branches'
    );
  });

  it('encodes spaces in names', () => {
    expect(repoBranchesUrl(BASE_WITH_SLASH, 'My Project', 'my repo')).toBe(
      'https://dev.azure.com/myorg/My%20Project/_git/my%20repo/branches'
    );
  });

  it('handles collection URI without trailing slash', () => {
    expect(repoBranchesUrl(BASE_WITHOUT_SLASH, 'MyProject', 'my-repo')).toBe(
      'https://dev.azure.com/myorg/MyProject/_git/my-repo/branches'
    );
  });
});

describe('projectUrl', () => {
  it('builds the project start page URL', () => {
    expect(projectUrl(BASE_WITH_SLASH, 'MyProject')).toBe(
      'https://dev.azure.com/myorg/MyProject'
    );
  });

  it('encodes spaces in project name', () => {
    expect(projectUrl(BASE_WITH_SLASH, 'My Project')).toBe(
      'https://dev.azure.com/myorg/My%20Project'
    );
  });

  it('handles collection URI without trailing slash', () => {
    expect(projectUrl(BASE_WITHOUT_SLASH, 'MyProject')).toBe(
      'https://dev.azure.com/myorg/MyProject'
    );
  });
});
