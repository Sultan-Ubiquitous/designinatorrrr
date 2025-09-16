import OpenAI from 'openai';
import {BaseChatModel} from '@langchain/core/language_models/chat_models';
import { AIMessage, AIMessageChunk, BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import type { CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager';
import { ChatGenerationChunk, type ChatGeneration, type ChatResult } from '@langchain/core/outputs';


export interface OpenRouterChatModelParams {
    apiKey: string;
    model: string;
    siteUrl?: string;
    siteName?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stream?: boolean;
}

export class OpenRouterChatModel extends BaseChatModel {
    private openai: OpenAI;
    public model: string;
    public temperature: number;
    public maxTokens?: number | undefined;
    public topP?: number | undefined;
    public frequencyPenalty?: number | undefined;
    public presencePenalty?: number | undefined;

    constructor(params: OpenRouterChatModelParams) {
        super({});
        this.model = params.model;
        this.temperature = params.temperature ?? 0.7;
        this.maxTokens = params.maxTokens;
        this.topP = params.topP;
        this.frequencyPenalty = params.frequencyPenalty;
        this.presencePenalty = params.presencePenalty;

        this.openai = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: params.apiKey as string,
            defaultHeaders: {
                ...(params.siteUrl && {'HTTP-Referer': params.siteUrl}),
                ...(params.siteName && {'X-Title': params.siteName}),
            },
        });
    }

    _llmType(): string {
        return "openrouter";
    }

    _identifyingParams(): Record<string, any> {
        return {
            model: this.model,
            temperature: this.temperature,
            maxTokens: this.maxTokens,
            topP: this.topP,
            frequencyPenalty: this.frequencyPenalty,
            presencePenalty: this.presencePenalty,
        };
    }

    private convertMessageToOpenAI(messages: BaseMessage[]): any[] {
        return messages.map((message) => {
            if(message instanceof HumanMessage){
                return {role: "user", content: message.content}
            } else if(message instanceof AIMessage){
                return {role: "assistant", content: message.content}
            } else if (message instanceof SystemMessage){
                return {role: "system", content: message.content}
            } else {
                return {
                    role: (message as any).role || "user",
                    content: message.content
                }
            }
        });
    }

    async _generate(
        messages: BaseMessage[],
        options?: this["ParsedCallOptions"],
        runManager?: CallbackManagerForLLMRun
    ) : Promise<ChatResult> {
        const openAiMessages = this.convertMessageToOpenAI(messages);

        try {
            const requestParams: any = {
                model: this.model,
                messages: openAiMessages,
                temperature: this.temperature,
            }

            if (this.maxTokens !== undefined) {
                requestParams.max_tokens = this.maxTokens;
            }
            if (this.topP !== undefined) {
                requestParams.top_p = this.topP;
            }
            if (this.frequencyPenalty !== undefined) {
                requestParams.frequency_penalty = this.frequencyPenalty;
            }
            if (this.presencePenalty !== undefined) {
                requestParams.presence_penalty = this.presencePenalty;
            }
            if (options?.stop !== undefined) {
                requestParams.stop = options.stop;
            }

            const response = await this.openai.chat.completions.create(requestParams);

            const choice = response.choices[0];
            if(!choice) {
                throw new Error("No response from OpenRouter");
            }

            const message = new AIMessage({
                content: choice.message.content || "",
            });

            const generation: ChatGeneration = {
                text: choice.message.content || "",
                message,
                generationInfo: {
                finishReason: choice.finish_reason,
                usage: response.usage,
            },
        }

            return {
                generations: [generation],
                llmOutput: {
                    tokenUsage: response.usage,
                    model: response.model,
                },
            };
        } catch (error: any) {
            throw new Error(`OpenRouter API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async *_streamResponseChunks(messages: BaseMessage[], options?: this["ParsedCallOptions"], runManager?: CallbackManagerForLLMRun): AsyncGenerator<ChatGenerationChunk>{
        const openAiMessages = this.convertMessageToOpenAI(messages);
        try {

            const requestParams = {
            model: this.model,
            messages: openAiMessages,
            temperature: this.temperature,
            stream: true as const,
            ...(this.maxTokens !== undefined && { max_tokens: this.maxTokens }),
            ...(this.topP !== undefined && { top_p: this.topP }),
            ...(this.frequencyPenalty !== undefined && { frequency_penalty: this.frequencyPenalty }),
            ...(this.presencePenalty !== undefined && { presence_penalty: this.presencePenalty }),
            ...(options?.stop !== undefined && { stop: options.stop }),
        };


            const stream = await this.openai.chat.completions.create(requestParams);

            for await (const chunk of stream) {
                const choice = chunk.choices[0];
                if(choice?.delta?.content) {
                    const message = new AIMessageChunk({
                        content: choice.delta.content,
                    });

                    if (runManager) {
                    await runManager.handleLLMNewToken(choice.delta.content);
                }

                    yield new ChatGenerationChunk({
                        text: choice.delta.content,
                        message,
                        generationInfo: {
                            finishReason: choice.finish_reason,
                        },
                    });
                }
            }
        } catch (error) {
            throw new Error(`OpenRouter streaming error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
