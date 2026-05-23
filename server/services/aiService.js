export const generateAIResponse = async (messages) => {
  const apiKey = process.env.VITE_AI_API_KEY || process.env.AI_API_KEY;
  
  if (!apiKey) {
    throw new Error("NVIDIA API key is missing in environment variables.");
  }

  // Ensure system prompt is always injected if not present
  // But we usually inject it from the frontend or we can enforce it here.
  // The frontend currently passes the system prompt as the first message.
  
  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "meta/llama-3.1-70b-instruct", // Upgraded to recommended model
      messages: messages,
      temperature: 0.5,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`NVIDIA API Error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};
