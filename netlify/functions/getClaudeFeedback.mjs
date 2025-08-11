import "dotenv/config.js"
import axios from "axios";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `
You are an assistant that receives a trivia question and answer from a user and gives them information on why this answer is correct. You don't have to go into too much detail, only a brief 2-3 sentence summary or 50 words max is enough. You can explain a bit of background on the topic but try to keep the answer focused on how this answer works as a response to the given question. Use a third person perspective in your response.
`

const anthropic = new Anthropic({
    // Make sure you set an environment variable in Scrimba 
    // for ANTHROPIC_API_KEY
    apiKey: process.env.VITE_ANTHROPIC_API_KEY
})

export default async (event, context) => {
    try {
        const requestBody = await event.json();
        console.log("Received event:", requestBody);
        if (!requestBody.prompts || !Array.isArray(requestBody.prompts) || requestBody.prompts.length === 0) {
            return new Response("Invalid prompts provided.", {status: 400});
        }
        const messages = requestBody.prompts.map(prompt => ({
            role: "user",
            content: `I have this question: ${prompt.question}. The answer is ${prompt.answer}. Please explain why this answer is correct. Please include only the explanation in your response, no other text or formatting.`
        }))

        let response = await anthropic.messages.create({
            model: "claude-3-5-haiku-latest",
            max_tokens: 2048,
            system: SYSTEM_PROMPT,
            messages: [...messages]
        });
        console.log("Claude response:", response.content[0].text);

        return new Response(JSON.stringify({
                response: response.content[0].text || "Sorry, I couldn't fetch an explanation for this question at the moment."
            }, {status: 200}));
    } catch (error) {
        console.error("Error fetching feedback from Claude:", error);
        return new Response(`There was an error with Claude: ${JSON.stringify(error)}`, {status: 500});
    }
}