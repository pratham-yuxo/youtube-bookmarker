// background.js
// ensuring that the extension only works in youtube.com
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    // Check if the URL is a YouTube URL
    if (tab.url && tab.url.includes("youtube.com")) {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["content.js"]
      });
    } else {
      // Disable or do nothing when not on YouTube
      console.log("Not a YouTube page, extension is inactive.");
    }
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url && tab.url.includes("youtube.com")) {
      chrome.action.enable(activeInfo.tabId);
    } else {
      chrome.action.disable(activeInfo.tabId);
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveBookmark") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0].url;
      const videoTitle = tabs[0].title; // Get the title of the current tab

      chrome.tabs.sendMessage(tabs[0].id, { action: "getVideoTime" }, (response) => {
        const currentTime = response.currentTime;
        const bookmark = { time: currentTime, note: "", url: currentUrl, title: videoTitle };

        chrome.storage.local.get({ bookmarks: {} }, (result) => {
          const bookmarks = result.bookmarks;
          if (!bookmarks[currentUrl]) {
            bookmarks[currentUrl] = [];
          }
          bookmarks[currentUrl].push(bookmark);
          chrome.storage.local.set({ bookmarks: bookmarks }, () => {
            console.log("Bookmark saved!");
          });
        });
      });
    });
  }
});
