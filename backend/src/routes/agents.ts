import express from 'express';
import {Router, Request, Response} from 'express';
import { getRepoFiles, getRepoOwner } from '../utils/githubFunction.js';
import { filterFrontendFiles } from '../utils/filterFunctions.js';
import auth from '../utils/auth.js';
import { fromNodeHeaders } from 'better-auth/node';
import prisma from '../utils/prisma.js';


const router: Router = express.Router();

router.post('/tokensAgents', async (req: Request, res: Response)=>{
    try {
        const {projectName} = req.body;
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        const userId = session?.user.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: No user ID found' });
        }
        
    } catch (error) {
        
    }
})

export default router;