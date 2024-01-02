// background.js


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'navigateToPage') {
    // Navigate to the specified URL
    nextUrl = message.url;
    chrome.tabs.update(sender.tab.id, { url: message.url });

  } 
  if (message.action === 'navigateToNewPage') {
    nextUrl = message.url;
    chrome.tabs.create({ url: message.url });
  }
});


