const OpenAI = require('openai');
require("dotenv").config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const requestData = {
    model: 'gpt-3.5-turbo',
    messages: [
        {
            role: 'system',
            content: 'You are a helpful assistant.',
        },
        {
            role: 'user',
            content: 'Hello!',
        },
    ],
};

async function getGPTResponse() {
    try {
        const response = await openai.chat.completions.create(requestData);
        console.log("Response from OpenAI:", response.choices[0].message.content);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

getGPTResponse();