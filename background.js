var tabId;
// open/close when clicking the toolbar button
chrome.action.onClicked.addListener(injectHeadingsMapScript);

// listen for messages
chrome.runtime.onConnect.addListener(connected);
// No global tabId: always use tabId from event

function injectHeadingsMapScript(tab) {
  // tabId = tab.id; // Removed global tabId assignment

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      files: ["content_scripts/headingsMap.js"],
    },
    () => {
      sendActionToHeadingsMapScript(tab.id, "toggle");
    }
  );

  chrome.scripting.insertCSS({
    target: { tabId: tab.id },
    files: ["content_scripts/headingsMap.css"],
  });
}

function connected(portFromCS) {
  portFromCS.onMessage.addListener(function (message) {
    if (
      message.action === "update" &&
      portFromCS.sender &&
      portFromCS.sender.tab &&
      portFromCS.sender.tab.id
    ) {
      updateHeadingsMap(portFromCS.sender.tab.id);
    } else if (message.action === "settings") {
      var openOptionsPage = chrome.runtime.openOptionsPage();

      openOptionsPage.then(reportSuccess, reportError);
    }
  });
}

function sendActionToHeadingsMapScript(tabId, action) {
  var message = { action: action };

  chrome.storage.local.get(
    [
      "showHeadLevels",
      "showHeadError",
      "showHeadErrorH1",
      "showOutLevels",
      "showOutElem",
      "showOutError",
    ],
    sendActionWithSettings
  );

  function sendActionWithSettings(settings) {
    message.settings = settings;

    chrome.tabs.sendMessage(tabId, message);
  }
}

// showHeadingsMap is now handled inline after injection

function updateHeadingsMap() {
  sendActionToHeadingsMapScript(tabId, "update");
}

function reportSuccess() {}

function reportError(error) {}
