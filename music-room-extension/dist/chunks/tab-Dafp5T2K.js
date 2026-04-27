async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    throw new Error("No active tab found");
  }
  const url = tab.url ?? "";
  let domain = "";
  try {
    domain = new URL(url).hostname;
  } catch {
    domain = "";
  }
  return {
    tabId: tab.id,
    title: tab.title ?? "Unknown Tab",
    domain,
    url
  };
}
export {
  getActiveTab as g
};
