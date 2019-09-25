let data = {};

// Set/get data in persisten background's memory
// TODO: Migrate keyring to persistent background process. And, view(react) should interact with it indirectly.
chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  if (msg.type === "setPersistentMemory") {
    data = { ...data, ...msg.data };
    sendResponse();
  } else if (msg.type === "getPersistentMemory") {
    sendResponse(data);
  }
});
