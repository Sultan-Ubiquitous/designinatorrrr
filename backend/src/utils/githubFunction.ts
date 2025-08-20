import { Octokit } from 'octokit';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export function getRepoOwner(url: string): {owner: string; repo: string} {
    const match = url.match(/github\.com[/:]([^/]+)\/([^/]+?)(\.git)?$/);
    if(!match) {
        throw new Error("Invalid Github repository URL");
    }
    return {owner: match[1], repo: match[2]}
}

export async function getRepo(OWNER: string, REPO: string, PATH: string){
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}',{
        owner: OWNER,
        repo: REPO,
        path: PATH,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        },
    });

     return response;
}


export function filterFrontendFiles(allFilesPaths: string[]): string[] {
    const frontendExtensions = [
    '.html', '.css', '.scss', '.less', '.sass',
    '.js', '.jsx', '.ts', '.tsx',
    '.vue', '.svelte',
    '.json', 
    '.md', '.mdx', 
    '.svg', 
    ];

    const frontendDirPatterns = [
    'src/', 'public/', 'assets/', 'static/',
    'components/', 'containers/', 'layouts/', 'pages/',
    'styles/', 'theme/', 'themes/', 'design/', 'tokens/',
    'views/', 'client/', 'frontend/',
    '.storybook/',
    ];

    const frontendFileNames = [
    'tailwind.config.js', 'tailwind.config.ts',
    'vite.config.js', 'vite.config.ts',
    'postcss.config.js',
    'package.json',
    'theme.js', 'theme.ts',
    'styles.js', 'styles.ts',
    'tokens.json', 'design-tokens.json',
    'tsconfig.json',
    ];

    const exclusionPatterns = [
    'backend/', 'server/', 'api/', 'database/', 'prisma/',
    'node_modules/', 'dist/', 'build/', 'out/', '.next/', '.nuxt/', '.svelte-kit/',
    '.github/', 'docs/', '.vscode/',
    '.test.', '.spec.', '__tests__',
    'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
    ];

    const frontendFiles = allFilesPaths.filter(path => {
        const lowerCasePath = path.toLowerCase();

        if(exclusionPatterns.some(pattern => lowerCasePath.includes(pattern))){
            return false;
        }

        const hasFrontendExtension = frontendExtensions.some(ext => lowerCasePath.endsWith(ext));
        if (hasFrontendExtension) return true;

        const isInFrontendDir = frontendDirPatterns.some(dir => lowerCasePath.includes(dir));
        if (isInFrontendDir) return true;

        const isFrontendConfigFile = frontendFileNames.some(name => lowerCasePath.endsWith(name));
        if (isFrontendConfigFile) return true;

        return false;
    })

    return frontendFiles;
}

export async function getRepoFiles(repoUrl: string){
    const {owner, repo} = getRepoOwner(repoUrl);
    const rawRepoData = await octokit.rest.repos.get({owner, repo});
    const defaultBranch = rawRepoData.data.default_branch;

    const {data: branchData} = await octokit.rest.repos.getBranch({
        owner,
        repo,
        branch: defaultBranch,
    });
    const latestCommitSha = branchData.commit.sha;

    const {data: treeData} = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: latestCommitSha,
        recursive: 'true',
    });

    const filePaths = treeData.tree
    .filter(item => item.type === 'blob' && item.path)
    .map(item => item.path!);

    return filePaths;
}