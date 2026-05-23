import { generateAIResponse } from '../services/aiService.js';

export const handleChat = async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format. Expected an array." });
    }

    const aiResponse = await generateAIResponse(messages);
    
    return res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error("Chat Controller Error:", error);
    return res.status(500).json({ error: "Failed to connect to AI service. Please try again later." });
  }
};
