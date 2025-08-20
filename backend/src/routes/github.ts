import express from 'express';
import {Router, Request, Response} from 'express';
import { Buffer } from 'buffer';
import { getRepo, getRepoFiles, getRepoOwner } from '../utils/githubFunction.js';

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

router.get('/fileNames', async (req: Request, res: Response) => {
    try {
        const repoUrl = req.query.giturl;
        console.log(repoUrl);
        
        if(!repoUrl){
        return res.status(400).send("Please provide a 'repoUrl' in the request body.");
        } 
        //@ts-ignore
        const filePath = await getRepoFiles(repoUrl);
        res.type('json').send(filePath);

    } catch (error) {
         console.error("Failed to fetch or decode file:", error);
        res.status(500).send("Error fetching file from GitHub.");
    }
})

router.post('/extractRepo',async (req: Request, res:Response)=>{
    const repoUrl = req.query.giturl;
    if(!repoUrl){
        return res.status(400).send("Please provide a 'repoUrl' in the request body.");
    }
    try {
        //@ts-ignore
        const {owner, repo} = getRepoOwner(repoUrl)
    } catch (error) {
        console.error("Failed to fetch or decode file:", error);
        res.status(500).send("Error fetching file from GitHub.");
    }
});

export default router;