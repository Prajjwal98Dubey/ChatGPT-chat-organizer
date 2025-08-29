chrome.runtime.onInstalled.addListener(() => {
  console.log('ChatGPT Chat Organizer extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'chatPageReady') {
    console.log('ChatGPT page ready:', request.url);
    
    // Update extension badge when on ChatGPT page
    if (sender.tab && sender.tab.id) {
      chrome.action.setBadgeText({
        text: '●',
        tabId: sender.tab.id
      });
      
      chrome.action.setBadgeBackgroundColor({
        color: '#10b981',
        tabId: sender.tab.id
      });
    }
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (!tab.url.includes('chatgpt.com/c/') && !tab.url.includes('chat.openai.com/c/')) {
      chrome.action.setBadgeText({
        text: '',
        tabId: tabId
      });
    }
  }
});

chrome.action.onClicked.addListener((tab) => {
});