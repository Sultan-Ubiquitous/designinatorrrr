import { filterTokenAgentFiles } from "../../utils/filterFunctions.js";
import { retrieveFileContent } from "../../utils/githubFunction.js";
import { RepoFile } from "../../utils/interfaces.js";
import prisma from "../../utils/prisma.js";
import { ProjectTokenAnalysisAgent } from "./projectTokenAnalysisAgent.js";
import * as dotenv from "dotenv";

dotenv.config();


export async function tokensAgent(userId: string, projectName: string){

    const apiKey = process.env.OPENROUTER_API_KEY as string;

    try {
        const projet = await prisma.project.findFirst({
        where: {
            userId,
            name: projectName,
        },
        select: {
            name: true,
            githubOwner: true,
            files: true,
        }
    });

    if(!projet){
        throw new Error(`Project "${projectName}" not found for user ${userId}.`);
    }

    const repoFiles: RepoFile[] = projet?.files.map((file) => ({
        path: file.filePath,
        content: file.content || "",
        type: file.fileType,
    }));

    const filteredFiles = filterTokenAgentFiles(repoFiles);
    console.log(filteredFiles);
    
    const githubOwner = projet.githubOwner;

    const populatedFiles = await retrieveFileContent(githubOwner, projectName, filteredFiles);
    
    const analysisAgent = new ProjectTokenAnalysisAgent(apiKey);
    const systemPrompt = await analysisAgent.processProjectFiles(populatedFiles);


    return systemPrompt;
    

    } catch (error) {
        console.log(error);
        
    }
}


(async () => {
  try {
    const result = await tokensAgent(
      "mw1RvKIAj5luJUfHMfFq4gajGxm2fsZb",
      "awwwards"
    );
    console.log("SystemPrompt:", result);
  } catch (err) {
    console.error("Failed to run tokensAgent:", err);
  }
})();
