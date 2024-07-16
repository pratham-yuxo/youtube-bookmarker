// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "saveBookmark") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getVideoTime" }, (response) => {
          const currentTime = response.currentTime;
          const currentUrl = tabs[0].url;
          const bookmark = { time: currentTime, note: "", url: currentUrl };
  
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
  