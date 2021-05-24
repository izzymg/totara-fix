function init() {
  // Grab message element in popup and add any messages received from the background script to it
  const message = document.querySelector("#message");
  chrome.runtime.onMessage.addListener(function(received) {
    if(received.replacementsMade !== null ) {
      message.classList.remove("error");
      message.classList.add("status");
      message.textContent = `Replacements made: ${received.replacementsMade}`;
    }
    if(received.error) {
      message.classList.add("error");
      message.classList.remove("status");
      message.textContent = "Error: " + received.error;
    }
    if(received.status) {
      message.classList.remove("error");
      message.classList.add("status");
      message.textContent = received.status + "...";
    }
  });
  
  // Subscribe to all popup button presses and forward message to background script
  
  document.querySelector("#fixBadgeMessagingStart").addEventListener("click", function() {
    chrome.runtime.sendMessage({ cmd: "fixBadgeMessaging" });
  });

  document.querySelector("#bulkBadgeCancel").addEventListener("click", function() {
    chrome.runtime.sendMessage({ cmd: "bulkBadgeCancel" });
  });

  document.querySelector("#addBadge").addEventListener("click", function() {
    chrome.runtime.sendMessage({ cmd: "addBadge" });
  });

  document.querySelector("#logSearch").addEventListener("click", function() {
    chrome.runtime.sendMessage({ cmd: "logSearch" });
  });

  document.querySelector("#bulkBadgeCSV").addEventListener("change", function() {
    // Remove trailing commas, split by commas into array
    this.files[0].text().then(csv => {
      let data = csv.replace(/,{2,}/g, ",").split(",").map(link => {
        return link.trim();
      });
      chrome.runtime.sendMessage({ cmd: "bulkBadgeFix", data });
    });
  });
}

if(document.readyState == "complete") {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}