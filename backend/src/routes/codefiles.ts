import express from 'express';
import {Router, Request, Response} from 'express';
import { getRepoFiles, getRepoOwner } from '../utils/githubFunction.js';
import { filterFrontendFiles } from '../utils/filterFunctions.js';
import auth from '../utils/auth.js';
import { fromNodeHeaders } from 'better-auth/node';
import prisma from '../utils/prisma.js';


const router: Router = express.Router();

router.post('/sendFiles', async (req: Request, res: Response) => {
    try {
        let { gitUrl } = req.body;
    
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers)
    });
    
    const userId = session?.user.id;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: No user ID found' });
    }

    const {owner, repo} = getRepoOwner(gitUrl);
    const files = await getRepoFiles(owner, repo);
    const frontendFiles = await filterFrontendFiles(owner, repo, files);

    
    const project = await prisma.project.create({
      data: {
        name: repo,
        githubOwner: owner,
        userId: userId,
        files: {
          create: frontendFiles.map((file) => ({
            filePath: file.path,
            fileType: file.type || 'unknown',
            content: file.content,
          })),
        },
      },
      include: {
        files: true,
      },
    });

    return res.status(201).json({
      message: 'Project and files saved successfully',
      project,
    });

    } catch (error: any) {
        console.error('Error in /sendFiles:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;