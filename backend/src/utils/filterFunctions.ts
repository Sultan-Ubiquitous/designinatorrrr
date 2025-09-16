import { RepoFile } from "./interfaces.js";


export function filterFrontendFiles(owner: string, repo: string, allFilesPaths: string[]): RepoFile[] {
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
    
    const filteredFrontendFilePaths = allFilesPaths.filter(path => {
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

    const result: RepoFile[] = filteredFrontendFilePaths.map(path=>({
        path,
        content: '',
        type: path.split('.').pop() || 'unknown',
    }));

    return result;
}

export function filterComponentAgentFiles(filePaths: RepoFile[]){
    const frontendExtensions = [
        '.html', '.css', 
        '.jsx', '.tsx', '.vue', '.svelte',          
        '.mdx',                                                                         
    ];

    const frontendDirPatterns = [
        'public/', 'assets/', 'static/',
        'components/', 'containers/', 'layouts/', 'pages/',
        'styles/', 'theme/', 'themes/', 'design/',
        'views/',
    ];

    const agentFiles = filePaths.filter(file => {
    const lowerCasePath = file.path.toLowerCase();
    const lowerCaseType = file.type.toLowerCase();
     
    const hasFileExtension = frontendExtensions.some(ext => lowerCasePath.endsWith(ext));
    if(hasFileExtension) return true;

    const isInDir = frontendDirPatterns.some(dir => lowerCasePath.includes(dir));
    if(isInDir) return true;

    return false;
    });

    return agentFiles;
}

export function filterTokenAgentFiles(filePaths: RepoFile[]){
const fileNames = [
    'tailwind.config.js', 'tailwind.config.ts', 'tailwind.config.mjs', 'tailwind.config.cjs',
    'tokens.json', 'theme.json', 'design-tokens.json', 'styles.json', 'theme.js', 'theme.ts'
];

const dirPatterns = [
    'styles/', 'style/', 'css/', 'scss/', 'sass/', 'less/',
    'theme/', 'themes/', 'design/', 'tokens/',
    'src/theme/', 'src/styles/'
];

const fileExtensions = [
    '.css', '.scss', '.sass', '.less', '.styl',
    '.json', '.jsonc', '.yaml', '.yml',
    '.js', '.ts'  
];

const agentFiles = filePaths.filter(file => {
    const lowerCasePath = file.path.toLowerCase();
    const lowerCaseType = file.type.toLowerCase();


    if (fileExtensions.includes(lowerCaseType)) return true;

    const hasFileExtension = fileExtensions.some(ext => lowerCasePath.endsWith(ext));
    if(hasFileExtension) return true;

    const isInDir = dirPatterns.some(dir => lowerCasePath.includes(dir));
    if(isInDir) return true;

    const hasFileName = fileNames.some(name => lowerCasePath.includes(name));
    if(hasFileName) return true;

    return false;
    });

    return agentFiles;
}