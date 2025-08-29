(function() {
  'use strict';
  function getChatTitle() {
    const titleSelectors = [
      'h1',
      '[data-testid*="conversation-title"]',
      '[class*="title"]',
      '[class*="heading"]',
      'title'
    ];
    for (const selector of titleSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        let title = element.textContent.trim();
        // Clean up the title
        title = title.replace(' - ChatGPT', '').replace('ChatGPT', '').trim();
        if (title && title !== 'New chat' && title.length > 0) {
          return title;
        }
      }
    }
    const messageSelectors = [
      '[data-message-author-role="user"]',
      '[class*="user"]',
      '[class*="message"]'
    ];

    for (const selector of messageSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        const text = element.textContent.trim();
        if (text.length > 10 && text.length < 100) {
          return text.substring(0, 80) + (text.length > 80 ? '...' : '');
        }
      }
    }

    return 'ChatGPT Conversation';
  }
  function getConversationContext() {
    // Try to find conversation messages
    const messageSelectors = [
      '[data-message-author-role="user"]',
      '[class*="message"]',
      '[class*="conversation"]',
      '[role="presentation"]',
      'main'
    ];

    let context = '';
    for (const selector of messageSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        const messages = Array.from(elements)
          .slice(0, 3)
          .map(el => el.textContent?.trim())
          .filter(text => text && text.length > 10)
          .join(' ');
        
        if (messages.length > 50) {
          context = messages.substring(0, 200) + '...';
          break;
        }
      }
    }

    return context || getChatTitle();
  }
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getChatInfo') {
      const chatInfo = {
        title: getChatTitle(),
        url: window.location.href,
        context: getConversationContext()
      };
      sendResponse(chatInfo);
    }
  });
  function notifyPageReady() {
    try {
      chrome.runtime.sendMessage({
        action: 'chatPageReady',
        url: window.location.href,
        title: getChatTitle()
      });
    } catch (error) {
      console.log('Extension context invalidated');
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(notifyPageReady, 1000);
    });
  } else {
    setTimeout(notifyPageReady, 1000);
  }
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(notifyPageReady, 500);
    }
  }).observe(document, { subtree: true, childList: true });

})();