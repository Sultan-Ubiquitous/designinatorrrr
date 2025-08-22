import { Octokit } from 'octokit';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import 'dotenv/config';

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
        '.jsx', '.tsx', '.vue', '.svelte',          
        '.mdx',                                                                         
    ];

    const frontendDirPatterns = [
        'public/', 'assets/', 'static/',
        'components/', 'containers/', 'layouts/', 'pages/',
        'styles/', 'theme/', 'themes/', 'design/', 'tokens/',
        'views/',
    ];

    const frontendFileNames = [
        'tailwind.config.js', 'tailwind.config.ts',
        'tokens.json', 'design-tokens.json',
    ];


    const exclusionPatterns = [
        
        'backend/', 'server/', 'database/', 'prisma/',
        'node_modules/', 'dist/', 'build/', 'out/', '.next/', '.nuxt/', '.svelte-kit/',
        '.github/', 'docs/', '.vscode/',

        
        'next.config.', 'vite.config.', 'postcss.config.', 'package.json',
        'tsconfig.json', '.gitignore', 'README.md', 'middleware.ts',

        'api/', 'utils/', 'lib/', 'hooks/', 'services/', 'auth', '.test.', '.spec.', '__tests__',

        '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.bmp',
        '.mp4', '.mov', '.webm', '.avi', '.mkv',                         
        '.mp3', '.wav', '.ogg',                                          
        '.woff', '.woff2', '.ttf', '.eot', '.otf',                       
    ];

    const frontendFiles = allFilesPaths.filter(path => {
        const lowerCasePath = path.toLowerCase();

        if(exclusionPatterns.some(pattern => lowerCasePath.includes(pattern))){
            return false;
        }

        const isDesignSystemFile = frontendFileNames.some(name => lowerCasePath.endsWith(name));
        if (isDesignSystemFile) return true;

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


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function printAllFileContent(owner: string, repo: string, filePaths: string[], outputFileName: string = 'files.txt'): Promise<string> {
    let combinedContent = '';
    console.log('Starting to fetch file content');

    for(const filePath of filePaths) {
        try {
            const {data} = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: filePath,
            });

            if('content' in data) {
                const decodedContent = Buffer.from(data.content, 'base64').toString('utf-8');
                combinedContent += `
                // ======================================================
                // File: ${filePath}
                // ======================================================

                ${decodedContent}
                `;
            console.log(`✅ Fetched and added: ${filePath}`);
            }
        } catch (error: any) {
            console.warn(`⚠️ Could not fetch content for file: ${filePath}. Skipping. Error:`, error.message); 
        }
    }

        const outputPath = path.join(__dirname, 'output', outputFileName);
        await fs.writeFile(outputPath, combinedContent);

        console.log(`\n🎉 Success! All content has been written to: ${outputPath}`);
        return outputPath;
    
}


export function getTokenFiles(allFilesPaths: string[]): string[] {
    const tokenFileExtensions = ['.css', '.scss', '.less', '.sass'];
    const tokenDirPatterns = ['styles/', 'theme/', 'themes/', 'design/', 'tokens/'];
    const tokenFileNames = [
        'tailwind.config.js', 'tailwind.config.ts',
        'tokens.json', 'design-tokens.json',
    ]; 

    return allFilesPaths.filter(path => {
        const lowerCasePath = path.toLowerCase();

        const isTokenConfigFile = tokenFileNames.some(name => lowerCasePath.endsWith(name));
        const hasTokenExtension = tokenFileExtensions.some(ext => lowerCasePath.endsWith(ext));
        const isInTokenDir = tokenDirPatterns.some(dir => lowerCasePath.includes(dir));

        return isTokenConfigFile || hasTokenExtension || isInTokenDir;
    });
}   

export function getComponentFiles(allFilesPaths: string[]): string[] {
    const componentExtensions = ['.jsx', '.tsx', '.vue', '.svelte', '.html', '.mdx'];
    const componentDirPatterns = [
        'public/', 'assets/', 'static/',
        'components/', 'containers/', 'layouts/', 'pages/',
        'views/',
    ];

    return allFilesPaths.filter(path => {
        const lowerCasePath = path.toLowerCase();

        const hasComponentExtension = componentExtensions.some(ext => lowerCasePath.endsWith(ext));
        const isInComponentDir = componentDirPatterns.some(dir => lowerCasePath.includes(dir));

        return hasComponentExtension || isInComponentDir;
    });

}


export async function checkLimit(){
    const { data: { rate } } = await octokit.request("GET /rate_limit");
    console.log(`Remaining requests: ${rate.remaining}`);
    console.log(`Rate limit resets at: ${new Date(rate.reset * 1000)}`);
}
