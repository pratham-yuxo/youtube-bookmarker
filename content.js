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
  function createPlusButton() {
    const button = document.createElement("button");
    button.innerHTML = '<i class="fa-solid fa-plus" style="color: #00ff40;"></i>'; // Using Font Awesome plus icon
    button.style.position = "absolute";
    button.style.bottom = "50px"; // Adjust based on your needs
    button.style.right = "20px"; // Adjust based on your needs
    button.style.zIndex = "1000";
    button.style.fontSize = "24px";
    button.style.padding = "10px";
    button.style.border = "none";
    button.style.borderRadius = "50%";
    // button.style.backgroundColor = "#ff0000"; // Red color, adjust as needed
    // button.style.color = "#fff";
    button.style.cursor = "pointer";
    
    button.addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "saveBookmark" });
    });
  
    const playerControls = document.querySelector(".ytp-right-controls");
    if (playerControls) {
      playerControls.appendChild(button);
    } else {
      console.error("Could not find YouTube player controls.");
    }
  }
  
  // loadFontAwesome();
  createPlusButton();