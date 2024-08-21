document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentUrl = tabs[0].url;
    displayBookmarksForCurrentVideo(currentUrl);
    displayAllBookmarks();
  });

  document.getElementById("tab-timestamps").addEventListener("click", () => {
    setActiveTab("tab-timestamps");
  });

  document.getElementById("tab-all-bookmarks").addEventListener("click", () => {
    setActiveTab("tab-all-bookmarks");
  });
});


document.getElementById("bookmarkBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentUrl = tabs[0].url;
    const videoTitle = tabs[0].title; // Get the title of the current tab
    // console.log(videoTitle);
    const titleElement = document.querySelector('yt-formatted-string.style-scope.ytd-watch-metadata');

if (titleElement) {
  const videoTitle = titleElement.textContent;
  console.log("Video Title:", videoTitle);
} else {
  console.log("Title element not found.");
}
    chrome.tabs.sendMessage(tabs[0].id, { action: "getVideoTime" }, (response) => {
      const currentTime = response.currentTime;
      const note = document.getElementById("note").value;
      const bookmark = { time: currentTime, note: note, url: currentUrl, title: videoTitle };

      // Save bookmark locally
      chrome.storage.local.get({ bookmarks: {} }, (result) => {
        const bookmarks = result.bookmarks;
        if (!bookmarks[currentUrl]) {
          bookmarks[currentUrl] = [];
        }
        bookmarks[currentUrl].push(bookmark);
        chrome.storage.local.set({ bookmarks: bookmarks }, () => {
          displayBookmarksForCurrentVideo(currentUrl);
          displayAllBookmarks();
        });
      });
    });
  });
});

function setActiveTab(tabId) {
  const tabIndicator = document.querySelector(".tab-indicator");
  const timestampsContent = document.getElementById("content-timestamps");
  const allBookmarksContent = document.getElementById("content-all-bookmarks");
  
  document.querySelectorAll(".tab").forEach(tab => {
    tab.classList.remove("active");
  });

  document.getElementById(tabId).classList.add("active");

  if (tabId === "tab-timestamps") {
    tabIndicator.style.transform = "translateX(0%)";
    timestampsContent.style.display = "block";
    allBookmarksContent.style.display = "none";
  } else {
    tabIndicator.style.transform = "translateX(100%)";
    timestampsContent.style.display = "none";
    allBookmarksContent.style.display = "block";
  }
}

function displayBookmarksForCurrentVideo(url) {
  chrome.storage.local.get({ bookmarks: {} }, (result) => {
    const bookmarks = result.bookmarks[url] || [];
    const bookmarksList = document.getElementById("bookmarksList");
    bookmarksList.innerHTML = "";

    if (bookmarks.length === 0) {
      const noBookmarksMessage = document.createElement("p");
      noBookmarksMessage.textContent = "No bookmarks for this video.";
      bookmarksList.appendChild(noBookmarksMessage);
    } else {
      bookmarks.forEach((bookmark, index) => {
        const li = document.createElement("li");
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        const link = document.createElement("a");
        
        link.href = `${bookmark.url}&t=${Math.floor(bookmark.time)}s`;
        link.textContent = `Time: ${bookmark.time.toFixed(2)}`;
        link.addEventListener("click", (e) => {
          e.preventDefault();
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.update(tabs[0].id, { url: bookmark.url });
          });
        });
        
        summary.appendChild(link);
        details.appendChild(summary);

        const note = document.createElement("p");
        note.textContent = bookmark.note;
        details.appendChild(note);

        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash" style="color: #ff0000;"></i>';
        deleteBtn.className = "deletebtn";
        deleteBtn.addEventListener("click", () => {
          deleteBookmark(url, index);
        });

        li.appendChild(details);
        li.appendChild(deleteBtn);
        bookmarksList.appendChild(li);
      });
    }
  });
}

function displayAllBookmarks() {
  chrome.storage.local.get({ bookmarks: {} }, (result) => {
    const allBookmarks = result.bookmarks;
    const allBookmarksList = document.getElementById("allBookmarksList");
    allBookmarksList.innerHTML = "";

    for (const url in allBookmarks) {
      const bookmarks = allBookmarks[url];
      if (bookmarks.length === 0) continue;

      const urlLi = document.createElement("li");
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      const videoTitle = bookmarks[0].title; // Limiting to first 50 characters

      summary.innerHTML = `${videoTitle}`;
      details.style.width="100%";
      summary.style.textOverflow="ellipsis";
      summary.style.overflow="hidden";
      summary.style.whiteSpace="nowrap";
      // delete button
      const deleteAllBtn = document.createElement("button");
      deleteAllBtn.innerHTML = '<i class="fa-solid fa-trash" style="color: #ff0000;"></i>';
      deleteAllBtn.className = "deletebtn";
      deleteAllBtn.addEventListener("click", () => {
        deleteAllBookmarks(url);
      });

      // summary.appendChild(deleteAllBtn);

      const bookmarksDiv = document.createElement("div");
      bookmarksDiv.className = "content";

      bookmarks.forEach((bookmark, index) => {
        const li = document.createElement("li");
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        const link = document.createElement("a");
        link.addEventListener("click", (e) => {
          e.preventDefault();
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.update(tabs[0].id, { url: bookmark.url });
          });
        });
        li.style.width="100%";
        li.style.border="0px";
        li.style.marginLeft="14px";
        li.style.padding="5px 0px";
        li.style.justifyContent="unset"
        link.href = `${bookmark.url}&t=${Math.floor(bookmark.time)}s`;
        link.textContent = `Time: ${bookmark.time.toFixed(2)}`;
        
        summary.appendChild(link);
        details.appendChild(summary);

        const note = document.createElement("p");
        note.textContent = bookmark.note;
        details.appendChild(note);

        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash" style="color: #ff0000;"></i>';
        deleteBtn.className = "deletebtn";
        deleteBtn.addEventListener("click", () => {
          deleteBookmark(url, index);
        });

        li.appendChild(details);
        li.appendChild(deleteBtn);
        bookmarksDiv.appendChild(li);
      });

      details.appendChild(summary);
      details.appendChild(bookmarksDiv);
      urlLi.appendChild(details);
      // urlLi.appendChild(deleteAllBtn);
      allBookmarksList.appendChild(urlLi);
    }
  });
}

function deleteBookmark(url, index) {
  chrome.storage.local.get({ bookmarks: {} }, (result) => {
    const bookmarks = result.bookmarks;
    if (bookmarks[url]) {
      bookmarks[url].splice(index, 1);
      if (bookmarks[url].length === 0) {
        delete bookmarks[url];
      }
      chrome.storage.local.set({ bookmarks: bookmarks }, () => {
        displayBookmarksForCurrentVideo(url);
        displayAllBookmarks();
      });
    }
  });
}

function deleteAllBookmarks(url) {
  chrome.storage.local.get({ bookmarks: {} }, (result) => {
    const bookmarks = result.bookmarks;
    if (bookmarks[url]) {
      delete bookmarks[url];
      chrome.storage.local.set({ bookmarks: bookmarks }, () => {
        displayBookmarksForCurrentVideo(url);
        displayAllBookmarks();
      });
    }
  });
}
