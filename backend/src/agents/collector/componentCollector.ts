import { filterComponentAgentFiles } from "../../utils/filterFunctions.js";
import { retrieveFileContent } from "../../utils/githubFunction.js";
import { RepoFile } from "../../utils/interfaces.js";
import prisma from "../../utils/prisma.js";






/* 
What does the below function do? First it gets projectFiles from prisma, then it filters them
then it passes the filtered files to retrieve their content then passes them to the Agent to get the SystemPrompt
*/

export async function componentsAgent(userId: string, projectName: string){
    try {
        const project = await prisma.project.findFirst({
            where: {
                userId,
                name: projectName,
            },
            select: {
                files: true,
                name: true,
                githubOwner: true,
            }
        });

        if(!project){
            throw new Error(`Project "${projectName}" not found for user ${userId}.`);
        }
        
        const repoFiles: RepoFile[] = project?.files.map((file) => ({
            path: file.filePath,
            content: file.filePath,
            type: file.filePath,
        }));

        const filterdFiles = filterComponentAgentFiles(repoFiles);

        const populatedFiles =  await  retrieveFileContent(project.githubOwner,project.name,filterdFiles);

        return populatedFiles;

    } catch (error) {
        console.log(error);
    }
}

(async() => {
    try {
        const result = await componentsAgent(
            "mw1RvKIAj5luJUfHMfFq4gajGxm2fsZb",
            "awwwards"
        );
        console.log(result);
    } catch (error) {
        console.error("Failed to run tokensAgent:", error);
    }
})();