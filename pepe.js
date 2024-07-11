// popup.js

document.addEventListener("DOMContentLoaded", () => {
  console.log('listening event')
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0].url;
      console.log("calling function with url", currentUrl)
      displayBookmarksForCurrentVideo(currentUrl);
    });
  });
  
  document.getElementById("bookmarkBtn").addEventListener("click", () => {
    console.log("button clicked")
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0].url;
      chrome.tabs.sendMessage(tabs[0].id, { action: "getVideoTime" }, (response) => {
        const currentTime = response.currentTime;
        const note = document.getElementById("note").value || "";
        const bookmark = { time: currentTime, note: note, url: currentUrl };
  
        // Save bookmark locally
        chrome.storage.local.get({ bookmarks: {} }, (result) => {
          const bookmarks = result.bookmarks;
          if (!bookmarks[currentUrl]) {
            bookmarks[currentUrl] = [];
          }
          bookmarks[currentUrl].push(bookmark);
          chrome.storage.local.set({ bookmarks: bookmarks }, () => {
            displayBookmarksForCurrentVideo(currentUrl);
          });
        });
      });
    });
  });
  
  function displayBookmarksForCurrentVideo(url) {
    chrome.storage.local.get({ bookmarks: {} }, (result) => {
      console.log("here is the result",result);
      const bookmarks = result.bookmarks[url] || [];
      const bookmarksList = document.getElementById("bookmarksList");
      bookmarksList.innerHTML = "";
      bookmarks.forEach((bookmark, index) => {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = `${bookmark.url}&t=${Math.floor(bookmark.time)}s`;
        link.textContent = `Time: ${bookmark.time.toFixed(2)}, Note: ${bookmark.note}`;
        link.addEventListener("click", (e) => {
          e.preventDefault();
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.update(tabs[0].id, { url: link.href });
          });
        });
        li.appendChild(link);
        bookmarksList.appendChild(li);
      });
    });
  }
  