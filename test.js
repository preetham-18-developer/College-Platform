async function test() {
  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer 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"
    },
    body: JSON.stringify({
      model: "meta/llama-3.1-70b-instruct",
      messages: [{"role":"user","content":"Hi"}]
    })
  });
  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Response:", text);
}
test();
