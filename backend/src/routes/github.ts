import express from 'express';
import {Router, Request, Response} from 'express';
import { Buffer } from 'buffer';
import { checkLimit, filterFrontendFiles, getRepo, getRepoFiles, getRepoOwner, printAllFileContent } from '../utils/githubFunction.js';
import { error } from 'console';

const router: Router = express.Router();

router.get('/',async (req: Request, res:Response)=>{
    try {
        const response = await getRepo('Sultan-Ubiquitous', 'designinatorrrr', 'frontend/tsconfig.json');
        //@ts-ignore
        const base64Content = response.data.content;
        const decodedContent = Buffer.from(base64Content, 'base64').toString('utf-8');
        res.type('json').send(decodedContent);
    } catch (error) {
        console.error("Failed to fetch or decode file:", error);
        res.status(500).send("Error fetching file from GitHub.");
    }
});

router.get('/getLimit', async(req: Request, res: Response)=>{
    checkLimit();
    res.send('All Good My Ninja');
});

router.get('/printFileContent', async (req: Request, res: Response) => {
    try {
        const repoUrl = req.query.giturl; 
        
        if(!repoUrl){
            return res.status(400).send("Please provide a 'repoUrl' in the request body.");
        } //@ts-ignore
        
        const {owner, repo} = await getRepoOwner(repoUrl);        
        const files = await getRepoFiles(owner, repo);
        const frontendFiles = filterFrontendFiles(files);
        const printfiles = await printAllFileContent(owner, repo, frontendFiles, 'NiggaBoit.txt');

        if(printfiles){
            res.send('All good niggers');
        } else throw error
        

    } catch (error) {
         console.error("Failed to fetch or decode file:", error);
        res.status(500).send("Error fetching file from GitHub.");
    }
});

router.get('/fileNames', async (req: Request, res: Response) => {
    try {
        const repoUrl = req.query.giturl;
        
        if(!repoUrl){
        return res.status(400).send("Please provide a 'repoUrl' in the request body.");
        } //@ts-ignore
        const {owner, repo}= getRepoOwner(repoUrl);
        const files = await getRepoFiles(owner, repo);
        const frontendFiles = filterFrontendFiles(files);
        res.type('json').send(frontendFiles);

    } catch (error) {
         console.error("Failed to fetch or decode file:", error);
        res.status(500).send("Error fetching file from GitHub.");
    }
});



export default router;