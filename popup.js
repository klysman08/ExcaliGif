// ExcaliGif Popup logic
// Communicates with Excalidraw's content script to query status and toggle execution state

document.addEventListener('DOMContentLoaded', async () => {
  const statusBanner = document.getElementById('statusBanner');
  const statusText = document.getElementById('statusText');
  const gifToggle = document.getElementById('gifToggle');
  const gifCount = document.getElementById('gifCount');
  const engineStatus = document.getElementById('engineStatus');
  
  const flowToggle = document.getElementById('flowToggle');
  const flowStyle = document.getElementById('flowStyle');
  const flowSpeed = document.getElementById('flowSpeed');
  const flowSettingsGroup = document.getElementById('flowSettingsGroup');

  // New controls
  const gifSpeed = document.getElementById('gifSpeed');
  const gifSettingsGroup = document.getElementById('gifSettingsGroup');
  const flowDirection = document.getElementById('flowDirection');
  const particleSize = document.getElementById('particleSize');
  const particleSizeValue = document.getElementById('particleSizeValue');
  const particleSpacing = document.getElementById('particleSpacing');
  const particleSpacingValue = document.getElementById('particleSpacingValue');
  const glowIntensity = document.getElementById('glowIntensity');
  const advancedToggle = document.getElementById('advancedToggle');
  const advancedToggleIcon = document.getElementById('advancedToggleIcon');
  const advancedSettings = document.getElementById('advancedSettings');

  // Advanced settings toggle
  let advancedOpen = false;
  advancedToggle.addEventListener('click', () => {
    advancedOpen = !advancedOpen;
    advancedSettings.classList.toggle('visible', advancedOpen);
    advancedToggleIcon.classList.toggle('expanded', advancedOpen);
  });

  // Live range slider value labels
  particleSize.addEventListener('input', () => {
    particleSizeValue.textContent = particleSize.value;
  });
  particleSpacing.addEventListener('input', () => {
    particleSpacingValue.textContent = particleSpacing.value;
  });

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
    flowToggle.disabled = !status.connected;
    flowStyle.disabled = !status.connected;
    flowSpeed.disabled = !status.connected;
    gifSpeed.disabled = !status.connected;
    flowDirection.disabled = !status.connected;
    particleSize.disabled = !status.connected;
    particleSpacing.disabled = !status.connected;
    glowIntensity.disabled = !status.connected;

    // Load current settings from response or use defaults
    const settings = status.settings || {
      gifsEnabled: status.enabled,
      flowEnabled: true,
      flowStyle: 'particles',
      flowSpeed: 'medium',
      particleSize: 3,
      particleSpacing: 50,
      glowIntensity: 'medium',
      flowDirection: 'forward',
      gifSpeed: 1
    };

    gifToggle.checked = settings.gifsEnabled;
    flowToggle.checked = settings.flowEnabled;
    flowStyle.value = settings.flowStyle;
    flowSpeed.value = settings.flowSpeed;
    gifSpeed.value = settings.gifSpeed || 1;
    flowDirection.value = settings.flowDirection || 'forward';
    particleSize.value = settings.particleSize || 3;
    particleSizeValue.textContent = settings.particleSize || 3;
    particleSpacing.value = settings.particleSpacing || 50;
    particleSpacingValue.textContent = settings.particleSpacing || 50;
    glowIntensity.value = settings.glowIntensity || 'medium';

    flowSettingsGroup.style.display = settings.flowEnabled ? 'flex' : 'none';
    gifSettingsGroup.style.display = settings.gifsEnabled ? 'flex' : 'none';

    gifCount.textContent = status.activeGifCount;
    engineStatus.textContent = settings.gifsEnabled ? "Running" : "Paused";
    
    // Broadcast setting changes
    const updateSettings = () => {
      const currentSettings = {
        gifsEnabled: gifToggle.checked,
        flowEnabled: flowToggle.checked,
        flowStyle: flowStyle.value,
        flowSpeed: flowSpeed.value,
        particleSize: parseInt(particleSize.value, 10),
        particleSpacing: parseInt(particleSpacing.value, 10),
        glowIntensity: glowIntensity.value,
        flowDirection: flowDirection.value,
        gifSpeed: parseFloat(gifSpeed.value)
      };
      
      flowSettingsGroup.style.display = currentSettings.flowEnabled ? 'flex' : 'none';
      gifSettingsGroup.style.display = currentSettings.gifsEnabled ? 'flex' : 'none';
      
      chrome.tabs.sendMessage(tab.id, { action: "updateSettings", settings: currentSettings }, (response) => {
        engineStatus.textContent = currentSettings.gifsEnabled ? "Running" : "Paused";
      });
    };

    gifToggle.onchange = updateSettings;
    flowToggle.onchange = updateSettings;
    flowStyle.onchange = updateSettings;
    flowSpeed.onchange = updateSettings;
    gifSpeed.onchange = updateSettings;
    flowDirection.onchange = updateSettings;
    particleSize.oninput = updateSettings;
    particleSpacing.oninput = updateSettings;
    glowIntensity.onchange = updateSettings;
  }

  function showDisconnected(reason) {
    statusBanner.className = "status-banner disconnected";
    statusText.textContent = reason;
    
    gifToggle.disabled = true;
    gifToggle.checked = false;
    flowToggle.disabled = true;
    flowToggle.checked = false;
    flowStyle.disabled = true;
    flowSpeed.disabled = true;
    gifSpeed.disabled = true;
    flowDirection.disabled = true;
    particleSize.disabled = true;
    particleSpacing.disabled = true;
    glowIntensity.disabled = true;
    flowSettingsGroup.style.display = 'none';
    gifSettingsGroup.style.display = 'none';
    gifCount.textContent = "0";
    engineStatus.textContent = "Inactive";
  }
});
