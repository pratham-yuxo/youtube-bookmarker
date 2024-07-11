// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("in content js ,heres the request",request)
    if (request.action === "getVideoTime") {
      const video = document.querySelector("video");
      console.log(video)
      if (video) {
        sendResponse({ currentTime: video.currentTime });
      } else {
        sendResponse({ currentTime: null });
      }
    }
  });
  