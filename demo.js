const OpenAI = require("openai");

require("dotenv").config();

const configuration = {
  apiKey: process.env.OPENAI_API_KEY,
}
const openai = new OpenAI(configuration);

async function getGPTResponse() {
    try {
      const thread = await openai.beta.threads.create();
      console.log("Response from OpenAI:", thread);
    } catch (error) {
      console.error("Error:", error.message);
    }
  }
  
  getGPTResponse();
