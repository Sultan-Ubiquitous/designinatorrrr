import { RepoFile } from "./interfaces.js";
import prisma from "./prisma.js";

export async function getProjectFiles(userId: string, projectName: string): Promise<RepoFile[]>{
    const project =  await prisma.project.findFirst({
        where: {
            userId,
            name: projectName,
        },
        include: {
            files: true,
        },
    });

    if(!project){
        return [];
    }

    const repoFiles: RepoFile[] = project.files.map((file)=> ({
        path: file.filePath,
        content: file.content,
        type: file.fileType,
    }));

    return repoFiles;
}