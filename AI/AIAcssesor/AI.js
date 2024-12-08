

const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = 'AIzaSyA5hA5eakQ1p_wZF5xUc0eVg8160nN2uQw';
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function startChat() {
  const chatSession = model.startChat({
    generationConfig,
    history: [],
  });
  return chatSession;
}

async function sendMessage(message) {
  const chatSession = await startChat(); // Starts a new chat session
  const result = await chatSession.sendMessage(message); // Sends the message to the AI and waits for the response
  return result.response.text(); // Returns the text of the AI's response
}

module.exports = { sendMessage };
