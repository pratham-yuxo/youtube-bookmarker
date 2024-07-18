document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentUrl = tabs[0].url;
    displayBookmarksForCurrentVideo(currentUrl);
  });
});

document.getElementById("bookmarkBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentUrl = tabs[0].url;
    chrome.tabs.sendMessage(tabs[0].id, { action: "getVideoTime" }, (response) => {
      const currentTime = response.currentTime;
      const note = document.getElementById("note").value;
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
    const bookmarks = result.bookmarks[url] || [];
    const bookmarksList = document.getElementById("bookmarksList");
    bookmarksList.innerHTML = "";

    // If no bookmarks found, display a message or handle accordingly
    if (bookmarks.length === 0) {
      const noBookmarksMessage = document.createElement("p");
      noBookmarksMessage.textContent = "No bookmarks for this video.";
      bookmarksList.appendChild(noBookmarksMessage);
    } else {
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

        // Create a delete button
        const deleteBtn = document.createElement("button");
        // deleteBtn.textContent = "Delete";
        deleteBtn.innerHTML='<i class="fa-solid fa-trash" style="color: #ff0000;"></i>'
        deleteBtn.className="deletebtn"
        deleteBtn.addEventListener("click", () => {
          deleteBookmark(url, index);
        });

        li.appendChild(link);
        li.appendChild(deleteBtn);
        bookmarksList.appendChild(li);
      });
    }
  });
}

function deleteBookmark(url, index) {
  chrome.storage.local.get({ bookmarks: {} }, (result) => {
    const bookmarks = result.bookmarks;
    if (bookmarks[url]) {
      bookmarks[url].splice(index, 1); // Remove the specific bookmark
      if (bookmarks[url].length === 0) {
        delete bookmarks[url]; // Remove the URL key if no bookmarks left
      }
      chrome.storage.local.set({ bookmarks: bookmarks }, () => {
        displayBookmarksForCurrentVideo(url);
      });
    }
  });
}
