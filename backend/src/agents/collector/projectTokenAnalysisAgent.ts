import { PromptTemplate } from "@langchain/core/prompts";
import { RepoFile, ExtractedDetails } from "../../utils/interfaces.js";
import { OpenRouterChatModel } from "../../utils/langchain/chatModel.js";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

export class ProjectTokenAnalysisAgent {
    private llm: OpenRouterChatModel;
    private fileAnalysisPrompt: PromptTemplate;
    private summaryPrompt: PromptTemplate;

    constructor(apiKey: string, model: string = "deepseek/deepseek-r1:free"){
        this.llm = new OpenRouterChatModel({
            apiKey: apiKey,
            model: model,
            temperature: 0.1,
        });

        this.fileAnalysisPrompt = PromptTemplate.fromTemplate(`
            Analyze the following file and extract key design and development patterns:

            File Path: {filePath}
            File Type: {fileType}
            File Content:
            {fileContent}

            Please extract and categorize the following information:

            1. **Design Patterns**: CSS classes, naming conventions, layout patterns
            2. **Style Patterns**: Color schemes, typography, spacing, animations
            3. **Component Structure**: How components are organized, props patterns, state management
            4. **Utilities**: Helper classes, custom utilities, reusable functions
            5. **Key Features**: Notable functionality, interactions, or architectural decisions

            Provide a concise but comprehensive analysis focusing on patterns that would be important for maintaining consistency when creating new components.

            Format your response as:
            ## Design Patterns
            [Your analysis here]

            ## Style Patterns  
            [Your analysis here]

            ## Component Structure
            [Your analysis here]

            ## Utilities
            [Your analysis here]

            ## Key Features
            [Your analysis here]
            `);

        this.summaryPrompt = PromptTemplate.fromTemplate(`
            Based on the following analysis of multiple project files, create a comprehensive system prompt that can be used by a coding agent to generate new components that are consistent with the project's design patterns and architecture.

            File Analyses:
            {fileAnalyses}

            Create a system prompt that includes:
            1. Project overview and design philosophy
            2. Coding standards and conventions
            3. Styling guidelines and patterns
            4. Component architecture rules
            5. Utility usage guidelines
            6. Specific instructions for maintaining consistency

            The system prompt should be comprehensive yet concise, providing clear guidelines for generating new components that fit seamlessly into the existing codebase.

            Format the response as a clean system prompt that can be directly used by another AI coding agent.
            `);
    }

    private parseAnalysisResponse(response: string): {
        designPatterns: string;
        stylePatterns: string;
        componentStructure: string;
        utilities: string;
        keyFeatures: string;
    } {
        const sections = {
            designPatterns: "",
            stylePatterns: "",
            componentStructure: "",
            utilities: "",
            keyFeatures: "",
        };

        try {
            const designMatch = response.match(/## Design Patterns\s*\n([\s\S]*?)(?=\n## |$)/);
            const styleMatch = response.match(/## Style Patterns\s*\n([\s\S]*?)(?=\n## |$)/);
            const componentMatch = response.match(/## Component Structure\s*\n([\s\S]*?)(?=\n## |$)/);
            const utilitiesMatch = response.match(/## Utilities\s*\n([\s\S]*?)(?=\n## |$)/);
            const featuresMatch = response.match(/## Key Features\s*\n([\s\S]*?)(?=\n## |$)/);

            sections.designPatterns = designMatch ? designMatch[1].trim() : "",
            sections.designPatterns = designMatch ? designMatch[1].trim() : "";
            sections.stylePatterns = styleMatch ? styleMatch[1].trim() : "";
            sections.componentStructure = componentMatch ? componentMatch[1].trim() : "";
            sections.utilities = utilitiesMatch ? utilitiesMatch[1].trim() : "";
            sections.keyFeatures = featuresMatch ? featuresMatch[1].trim() : "";
        
        } catch (error) {
            console.error("Error parsing analysis response:", error); 
        }

        return sections;
    }

    async analyzeFile(file: RepoFile): Promise<ExtractedDetails>{
        try {
            const chain = RunnableSequence.from([
                this.fileAnalysisPrompt,
                this.llm,
                new StringOutputParser(),
            ]);

            const result = await chain.invoke({
                filePath: file.path,
                fileType: file.type,
                fileContent: file.content.substring(0, 10000),
            });

            const sections = this.parseAnalysisResponse(result);

            return {
                path: file.path,
                designPatterns: sections.designPatterns,
                stylePatterns: sections.stylePatterns,
                componentStructure: sections.componentStructure,
                utilities: sections.utilities,
                keyFeatures: sections.keyFeatures,
            };
        } catch (error) {
            console.error(`Error analyzing file ${file.path}:`, error);
            return {
                path: file.path,
                designPatterns: "Analysis failed",
                stylePatterns: "Analysis failed",
                componentStructure: "Analysis failed",
                utilities: "Analysis failed",
                keyFeatures: "Analysis failed",
            };

        }
    }

    async generateSystemPrompt(extractedDetails: ExtractedDetails[]): Promise<string> {
        try {
            const fileAnalyses = extractedDetails.map(detail => `
                ## File: ${detail.path}

                **Design Patterns:**
                ${detail.designPatterns}

                **Style Patterns:**
                ${detail.stylePatterns}

                **Component Structure:**
                ${detail.componentStructure}

                **Utilities:**
                ${detail.utilities}

                **Key Features:**
                ${detail.keyFeatures}
                `).join('\n');

            const chain = RunnableSequence.from([
                this.summaryPrompt,
                this.llm,
                new StringOutputParser(),
            ]);

            const systemPrompt = await chain.invoke({
                fileAnalyses: fileAnalyses,
            });

            return systemPrompt;
        } catch (error) {
            console.error("Error generating system prompt:", error);
            throw error;
        }
    }

    async processProjectFiles(files: RepoFile[]): Promise<string> {
        console.log(`🚀 Starting analysis of ${files.length} files...`);

        const extractedDetails: ExtractedDetails[] = [];

        for(const file of files) {
            console.log(`📄 Analyzing ${file.path}...`);
            const details = await this.analyzeFile(file);
            extractedDetails.push(details);
        }
        
        console.log("✅ File analysis complete. Generating system prompt...");

        const systemPrompt = await this.generateSystemPrompt(extractedDetails);
    
        console.log("🎉 System prompt generated successfully!");
    
        return systemPrompt;
    }
}