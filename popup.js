// ExcaliGif Popup logic
// Communicates with Excalidraw's content script to query status and toggle execution state

document.addEventListener('DOMContentLoaded', async () => {
  const statusBanner = document.getElementById('statusBanner');
  const statusText = document.getElementById('statusText');
  const gifToggle = document.getElementById('gifToggle');
  const gifCount = document.getElementById('gifCount');
  const engineStatus = document.getElementById('engineStatus');

  // Query the current active tab
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  
  if (!tab || !tab.url || !tab.url.includes('excalidraw.com')) {
    showDisconnected("Open excalidraw.com");
    return;
  }

  // Request status from the injected script (via content script)
  try {
    chrome.tabs.sendMessage(tab.id, { action: "getStatus" }, (response) => {
      // Check if runtime encountered an error (e.g. content script not loaded yet)
      if (chrome.runtime.lastError || !response) {
        showDisconnected("Refresh excalidraw.com");
        return;
      }
      
      showConnected(response);
    });
  } catch (e) {
    showDisconnected("Extension Error");
  }

  function showConnected(status) {
    statusBanner.className = "status-banner connected";
    statusText.textContent = status.connected ? "Excalidraw Connected" : "Canvas Loading...";
    
    gifToggle.disabled = !status.connected;
    gifToggle.checked = status.enabled;
    gifCount.textContent = status.activeGifCount;
    engineStatus.textContent = status.enabled ? "Running" : "Paused";
    
    // Add toggle switch listener
    gifToggle.onchange = () => {
      const enabled = gifToggle.checked;
      chrome.tabs.sendMessage(tab.id, { action: "toggleState", enabled: enabled }, (response) => {
        engineStatus.textContent = enabled ? "Running" : "Paused";
      });
    };
  }

  function showDisconnected(reason) {
    statusBanner.className = "status-banner disconnected";
    statusText.textContent = reason;
    
    gifToggle.disabled = true;
    gifToggle.checked = false;
    gifCount.textContent = "0";
    engineStatus.textContent = "Inactive";
  }
});
