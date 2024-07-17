chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("in content js, here's the request", request);
  if (request.action === "getVideoTime") {
    const video = document.querySelector("video");
    console.log("Video element found:", video);
    if (video) {
      sendResponse({ currentTime: video.currentTime });
    } else {
      sendResponse({ currentTime: null });
    }
  }
});

function createPlusButton() {
  console.log("Creating plus button...");
  const button = document.createElement("button");
  button.innerHTML = '<i class="fa fa-plus" style="color: #00ff40; position:absolute; top:13px;"></i>'; // Using Font Awesome plus icon
  button.className = 'ytp-button'; // Use YouTube's button class for consistent styling
  button.style.marginLeft = "10px"; // Adjust margin to create space between buttons
  button.style.fontSize="24px";
  button.style.position="relative";

  // Add hover effect
  button.addEventListener("mouseover", () => {
    button.querySelector("i").style.color = "#80ff80"; // Change color on hover
  });

  button.addEventListener("mouseout", () => {
    button.querySelector("i").style.color = "#00ff40"; // Revert to original color
  });


  button.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "saveBookmark" });
    console.log("Plus button clicked");
  });

  const playerControls = document.querySelector(".ytp-right-controls");
  console.log("Player controls found:", playerControls);
  if (playerControls) {
    playerControls.insertBefore(button, playerControls.firstChild); // Insert at the beginning
    console.log("Plus button added to player controls");
  } else {
    console.error("Could not find YouTube player controls.");
  }
}

function loadFontAwesome() {
  console.log("Loading Font Awesome...");
  const link = document.createElement("link");
  link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css";
  link.rel = "stylesheet";
  document.head.appendChild(link);
  console.log("Font Awesome loaded");
}

// Load Font Awesome library
loadFontAwesome();

// Create a MutationObserver to watch for changes in the DOM
let buttonAdded = false;
const observer = new MutationObserver((mutations) => {
  console.log("MutationObserver callback");
  if (!buttonAdded) {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          // Check if the added node is the YouTube player controls
          if (node.classList && node.classList.contains("ytp-right-controls")) {
            console.log("ytp-right-controls found:", node);
            // Create the plus button and add it to the controls
            createPlusButton();
            buttonAdded = true;
            // Disconnect the observer to avoid redundant executions
            observer.disconnect();
          }
        });
      }
    });
  }
});

// Start observing the document for added child nodes
observer.observe(document.body, { childList: true, subtree: true });
console.log("Observer started");

// Manual test - Attempt to create the button without waiting for mutations
const playerControls = document.querySelector(".ytp-right-controls");
if (playerControls) {
  console.log("Manual test - Player controls found:", playerControls);
  createPlusButton();
} else {
  console.error("Manual test - Could not find YouTube player controls.");
}
