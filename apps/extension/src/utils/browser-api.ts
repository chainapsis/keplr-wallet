export const getActiveTabOrigin = async (): Promise<string | undefined> => {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  if (tabs.length === 0) {
    console.error("No active tab found");
    return;
  }

  const activeTab = tabs[0];
  if (!activeTab.url) {
    console.error("No active tab URL found");
    return;
  }

  const url = new URL(activeTab.url);
  return url.origin;
};
