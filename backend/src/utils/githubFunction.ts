import { Octokit } from 'octokit';
import 'dotenv/config';
import { RepoFile } from './interfaces.js';

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

export async function retrieveFileContent(owner: string, repo: string, files: RepoFile[]): Promise<RepoFile[]>{
    const contentPromise = files.map(async (file) => {
        try {
            const {data: fileData} = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: file.path,
            });
            
            if('content' in fileData && fileData.type === 'file'){
                const content = Buffer.from(fileData.content, 'base64').toString('utf-8');

                return {
                    ...file,
                    content,
                };
            };
        } catch (error) {
            console.error(`Some error occured while fetching content for ${file.path}:`, error);
        }
        return file;
    });
    const updatedFiles = await Promise.all(contentPromise);
    return updatedFiles;
}





export async function getRepoFiles(owner: string, repo: string){
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



export async function checkLimit(){
    const { data: { rate } } = await octokit.request("GET /rate_limit");
    console.log(`Remaining requests: ${rate.remaining}`);
    console.log(`Rate limit resets at: ${new Date(rate.reset * 1000)}`);
}


