self.addEventListener('activate', () => {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(
      changeInfo.status === 'loading' &&
      tab.url &&
      tab.url.includes('://vrchat.com/home')
    ) {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['./scripts/import.js']
      });
    }
  });
});