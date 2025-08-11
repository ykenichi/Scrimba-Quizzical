import Anthropic from "@anthropic-ai/sdk"

const SYSTEM_PROMPT = `
You are an assistant that receives a trivia question and answer from a user and gives them information on why this answer is correct. You don't have to go into too much detail, only a brief 2-3 sentence summary or 100 words max is enough. You can explain a bit of background on the topic but try to keep the answer focused on how this answer works as a response to the given question. Use a third person perspective in your response.
`

// 🚨👉 ALERT: Read message below! You've been warned! 👈🚨
// If you're following along on your local machine instead of
// here on Scrimba, make sure you don't commit your API keys
// to any repositories and don't deploy your project anywhere
// live online. Otherwise, anyone could inspect your source
// and find your API keys/tokens. If you want to deploy
// this project, you'll need to create a backend of some kind,
// either your own or using some serverless architecture where
// your API calls can be made. Doing so will keep your
// API keys private.

const anthropic = new Anthropic({
    // Make sure you set an environment variable in Scrimba 
    // for ANTHROPIC_API_KEY
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true,
})

export async function getFeedbackFromClaude(question, answer) {

    const msg = await anthropic.messages.create({
        model: "claude-3-5-haiku-latest",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
            { role: "user", content: `I have this question: ${question}. The answer is ${answer}. Please explain why this answer is correct` },
        ],
    });
    return msg.content[0].text
}