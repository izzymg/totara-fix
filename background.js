// totara-fix background script

const ms = ms => new Promise(resolve => setTimeout(resolve, ms));

function getCurrentTabID() {
  return new Promise(resolve => {
    chrome.tabs.query({ "active": true, "currentWindow": true }, function(tabs) {
      resolve(tabs[0].id);
    });
  })
}

function logSearch() {
  chrome.tabs.executeScript({ file: "injected/iifes/logSearch.js" });
}

function addBadge() {
  chrome.tabs.executeScript({ file: "injected/iifes/addBadge.js" });
}

/** Injects script into current tab to fix common badge messaging issues */
function fixBadgeMessaging() {
  chrome.tabs.executeScript({ file: "injected/iifes/fixBadgeMessaging.js" });
}

async function bulkBadgeMessaging(badgeLinks) {
  // Grab current tab ID in case user unfocuses window
  const tabID = await getCurrentTabID();
  let shouldCancel = false;

  // Watch for cancel event sent by popup
  chrome.runtime.onMessage.addListener(message => {
    if(message && message.cmd == "bulkBadgeCancel") {
      shouldCancel = true;
    }
  });

  // Iterates through all badge links, changing tab to them and injecting the script to fix them.
  // Yields after each iteration to allow waiting on the injected script to signal its completion.
  function* fixUrls() {
    for(let i = 0; i < badgeLinks.length; i++) {
      if(shouldCancel) {
        return "Cancelled.";
      }

      const link = badgeLinks[i];
      // Open badge url
      chrome.tabs.executeScript(tabID, { code: `(() => { window.location.href = "${link}";})();` });
      // Give time to load before injecting script (hacky)
      setTimeout(() => {
        chrome.tabs.executeScript(tabID, { file: "injected/iifes/fixBadgeMessaging.js" });
      }, 3500);
      yield i;
    }
  }

  return new Promise(resolve => {
    let fixingUrls = fixUrls();
    chrome.runtime.onMessage.addListener(function handleNextMessage(message) {
      if(message && message.sender == "badgeFixer") {
        /* If the badge fixer successfully fixes a page, it causes a page refresh.
        We want to wait for this page refresh before the next iteration. */
        setTimeout(() => {
          let next = fixingUrls.next();
          if(next.done) {
            chrome.runtime.onMessage.removeListener(handleNextMessage);
            resolve(next.value);
            return;
          }
          chrome.runtime.sendMessage({ status: `Processing: ${next.value + 1}/${badgeLinks.length}` });
        }, 2500);
      }
    });
    chrome.runtime.sendMessage({ status: `Beginning ~ ${fixingUrls.next().value + 1}/${badgeLinks.length}` });
  });
}

function fixLoMessaging() {
  chrome.tabs.executeScript({ file: "injected/iifes/fixLoMessaging.js" });
}

async function bulkLoMessaging(loLinks) {
  console.log(loLinks)
  // Grab current tab ID in case user unfocuses window
  const tabID = await getCurrentTabID();
  let shouldCancel = false;

  // Watch for cancel event sent by popup
  chrome.runtime.onMessage.addListener(message => {
    if(message && message.cmd == "bulkLoCancel") {
      shouldCancel = true;
    }
  });

  function* fixUrls() {
    for(let i = 0; i < loLinks.length; i++) {
      if(shouldCancel) {
        return "Cancelled.";
      }

      const link = loLinks[i];
      chrome.tabs.executeScript(tabID, { code: `(() => { window.location.href = "${link}";})();` });
      setTimeout(() => {
        chrome.tabs.executeScript(tabID, { file: "injected/iifes/fixLoMessaging.js" });
      }, 3500);
      yield i;
    }
  }

  return new Promise(resolve => {
    let fixingUrls = fixUrls();
    chrome.runtime.onMessage.addListener(function handleNextMessage(message) {
      if(message && message.sender == "loFixer") {
        setTimeout(() => {
          let next = fixingUrls.next();
          if(next.done) {
            chrome.runtime.onMessage.removeListener(handleNextMessage);
            resolve(next.value);
            return;
          }
          chrome.runtime.sendMessage({ status: `Processing: ${next.value + 1}/${loLinks.length}` });
        }, 2500);
      }
    });
    chrome.runtime.sendMessage({ status: `Beginning ~ ${fixingUrls.next().value + 1}/${loLinks.length}` });
  });
}

// Allow popup action when domain matches TCA Totara domain
chrome.declarativeContent.onPageChanged.removeRules(null, () => {
  chrome.declarativeContent.onPageChanged.addRules([{
    conditions: [new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {
        hostEquals: "careeracademy.online"
      },
    })],
    actions: [new chrome.declarativeContent.ShowPageAction()]
  }]);
});

// Catch and direct messages from extension UI
chrome.runtime.onMessage.addListener(message => {
  switch(message.cmd) {
    case "logSearch":
      logSearch();
      break;
    case "addBadge":
      addBadge();
      break;
    case "fixBadgeMessaging":
      fixBadgeMessaging();
      break;
    case "bulkBadgeFix":
      bulkBadgeMessaging(message.data).then(ret => {
        chrome.runtime.sendMessage({ status: ret});
      }).catch(error => {
        chrome.runtime.sendMessage({ error: error.toString() });
      });
    case "fixLoMessaging":
      fixLoMessaging();
      break;
    case "bulkLoMessaging":
      bulkLoMessaging(message.data).then(ret => {
        chrome.runtime.sendMessage({ status: ret});
      }).catch(error => {
        chrome.runtime.sendMessage({ error: error.toString() });
      });
      break;
  }
});