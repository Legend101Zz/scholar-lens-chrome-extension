chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "EXTRACT_PAPER") {
    handlePaperExtraction(message.data, sendResponse);
    return true;
  }
});

async function handlePaperExtraction(paperData, sendResponse) {
  try {
    const session = await initializeAI();
    const summary = await generateSummary(session, paperData.abstract);
    const analysis = await analyzeMethodology(session, paperData.content);
    sendResponse({ success: true, summary, analysis });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

async function initializeAI() {
  const capabilities = await chrome.aiOriginTrial.languageModel.capabilities();
  if (capabilities.available === "no") {
    throw new Error("AI capabilities not available");
  }
  return await chrome.aiOriginTrial.languageModel.create({
    systemPrompt: "You are a research paper analysis assistant.",
    temperature: 0.7,
    topK: 3,
  });
}

async function generateSummary(session, text) {
  const summarizer = await self.ai.summarizer.create({
    type: "key-points",
    format: "markdown",
    length: "medium",
  });
  return await summarizer.summarize(text);
}

async function analyzeMethodology(session, text) {
  return await session.prompt(
    `Analyze the methodology of this research paper and identify key components:\n${text}`
  );
}
