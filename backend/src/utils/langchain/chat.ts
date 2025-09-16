import { OpenRouterChatModel } from "./chatModel.js";
import * as dotenv from 'dotenv';
dotenv.config();


const chatModel = new OpenRouterChatModel({
    apiKey: process.env.OPENROUTER_API_KEY as string,
    model: 'deepseek/deepseek-r1:free',
});

