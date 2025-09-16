import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// Your existing chat model initialization (no changes needed)
const chat = new ChatOpenAI(
  {
    model: 'deepseek/deepseek-r1:free',
    temperature: 0.8,
    streaming: true, // Streaming works with chains too!
    apiKey: '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', // Replace with your key
  },
  //@ts-ignore
  {
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      "HTTP-Referer": "YOUR_SITE_URL", // Optional, but recommended by OpenRouter
      "X-Title": "YOUR_SITE_NAME",     // Optional, but recommended by OpenRouter
    },
  },
);

// 1. Define a prompt template
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a witty comedian who tells jokes about {topic}."],
  ["human", "Tell me a short joke."],
]);

// 2. Define an output parser to get the string result
const outputParser = new StringOutputParser();

// 3. Create the chain by piping the components together
const jokeChain = prompt.pipe(chat).pipe(outputParser);

// 4. Invoke the chain with the required input variable
async function getJoke() {
  console.log("Fetching a joke...");
  const response = await jokeChain.invoke({
    topic: "programming",
  });

  console.log("\nResponse:");
  console.log(response);
}

getJoke();

// Example output:
// Fetching a joke...
//
// Response:
// Why do programmers prefer dark mode? Because light attracts bugs!