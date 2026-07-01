// ExcaliGif injected script
// Runs in the main context of the page to access React Fiber internals and the Canvas imageCache

(function() {
  console.log("[ExcaliGif] Inject script loaded.");

  let currentApp = null;
  let isEnabled = true; // Enabled by default
  const activeGifs = new Map(); // fileId -> GifPlayer instance

  class GifPlayer {
    constructor(fileId, cacheEntry, app) {
      this.fileId = fileId;
      this.cacheEntry = cacheEntry;
      this.app = app;
      
      this.originalImage = cacheEntry.image;
      this.width = 0;
      this.height = 0;
      this.frames = [];
      this.currentFrameIdx = 0;
      this.timer = null;
      this.activeCanvas = null;
      this.activeCtx = null;
      this.isLoaded = false;
      this.isDestroyed = false;
      
      this.loadPromise = this.init();
    }
    
    async init() {
      const src = this.originalImage.src;
      // Skip empty, invalid, or standard transparent 1x1 GIF placeholder sources
      if (!src || src.startsWith('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7')) {
        console.log("[ExcaliGif] Skipping empty/placeholder image source for fileId:", this.fileId);
        return;
      }
      this.lastSrc = src;
      
      try {
        // Reset player state in case of re-initialization
        if (this.timer) {
          clearTimeout(this.timer);
          this.timer = null;
        }
        this.frames = [];
        this.currentFrameIdx = 0;
        this.isLoaded = false;
        
        console.log("[ExcaliGif] Fetching GIF data for fileId:", this.fileId, "src:", src.substring(0, 100));
        const response = await fetch(src);
        const arrayBuffer = await response.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        // window.GifReader is loaded by omggif.js in the page scope
        if (typeof window.GifReader === 'undefined' && typeof GifReader === 'undefined') {
          throw new Error("GifReader is not defined in the scope.");
        }
        const ReaderClass = typeof window.GifReader !== 'undefined' ? window.GifReader : GifReader;
        const reader = new ReaderClass(bytes);
        this.width = reader.width;
        this.height = reader.height;
        
        const numFrames = reader.numFrames();
        console.log(`[ExcaliGif] Decoding GIF: ${this.width}x${this.height}, ${numFrames} frames`);
        if (numFrames <= 0) return;
        
        const accumBuffer = new Uint8ClampedArray(this.width * this.height * 4);
        let backupBuffer = null;
        
        for (let i = 0; i < numFrames; i++) {
          const info = reader.frameInfo(i);
          
          // 1. Handle disposal of previous frame
          if (i > 0) {
            const prevInfo = reader.frameInfo(i - 1);
            if (prevInfo.disposal === 2) {
              // Restore to background (clear the subrect to transparent)
              for (let y = prevInfo.y; y < prevInfo.y + prevInfo.height; y++) {
                for (let x = prevInfo.x; x < prevInfo.x + prevInfo.width; x++) {
                  const idx = (y * this.width + x) * 4;
                  accumBuffer[idx] = 0;
                  accumBuffer[idx + 1] = 0;
                  accumBuffer[idx + 2] = 0;
                  accumBuffer[idx + 3] = 0;
                }
              }
            } else if (prevInfo.disposal === 3 && backupBuffer) {
              // Restore to state before previous frame
              accumBuffer.set(backupBuffer);
            }
          }
          
          // 2. Backup buffer before drawing current frame if its disposal is 3
          if (info.disposal === 3) {
            if (!backupBuffer) {
              backupBuffer = new Uint8ClampedArray(this.width * this.height * 4);
            }
            backupBuffer.set(accumBuffer);
          }
          
          // 3. Decode frame pixels directly into the accumulated buffer
          reader.decodeAndBlitFrameRGBA(i, accumBuffer);
          
          // 4. Draw accumBuffer onto a frame canvas
          const frameCanvas = document.createElement('canvas');
          frameCanvas.width = this.width;
          frameCanvas.height = this.height;
          const frameCtx = frameCanvas.getContext('2d');
          const imgData = frameCtx.createImageData(this.width, this.height);
          imgData.data.set(accumBuffer);
          frameCtx.putImageData(imgData, 0, 0);
          
          // Delay is in hundredths of a second (10ms)
          const delay = info.delay * 10 || 100; // default to 100ms
          
          this.frames.push({
            image: frameCanvas,
            delay: delay
          });
        }
        
        // Setup active canvas that Excalidraw draws
        this.activeCanvas = document.createElement('canvas');
        this.activeCanvas.width = this.width;
        this.activeCanvas.height = this.height;
        
        // Mock standard HTMLImageElement properties
        Object.defineProperties(this.activeCanvas, {
          tagName: { value: 'IMG' },
          complete: { value: true },
          naturalWidth: { value: this.width },
          naturalHeight: { value: this.height }
        });
        
        this.activeCtx = this.activeCanvas.getContext('2d');
        this.isLoaded = true;
        
        if (isEnabled) {
          this.start();
        }
      } catch (e) {
        console.error("[ExcaliGif] Error initializing player for fileId " + this.fileId, e);
      }
    }
    
    start() {
      if (this.isDestroyed || !this.isLoaded) return;
      
      // Swap out the image in Excalidraw cache
      this.cacheEntry.image = this.activeCanvas;
      
      // Clear any previous loop
      if (this.timer) clearTimeout(this.timer);
      
      this.tick();
    }
    
    tick() {
      if (this.isDestroyed || !isEnabled) return;
      
      const frame = this.frames[this.currentFrameIdx];
      this.activeCtx.clearRect(0, 0, this.width, this.height);
      this.activeCtx.drawImage(frame.image, 0, 0);
      
      // Force Excalidraw element cache refresh by updating element version immutably
      if (this.app.api) {
        const elements = this.app.api.getSceneElements();
        let changed = false;
        
        const newElements = elements.map(el => {
          if (el.type === 'image' && el.fileId === this.fileId) {
            changed = true;
            return {
              ...el,
              version: el.version + 1,
              updated: Date.now()
            };
          }
          return el;
        });
        
        if (changed) {
          this.app.api.updateScene({ elements: newElements });
        }
      }
      
      this.app.triggerRender(true);
      
      this.currentFrameIdx = (this.currentFrameIdx + 1) % this.frames.length;
      this.timer = setTimeout(() => this.tick(), frame.delay);
    }
    
    stop() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      // Restore original static image
      this.cacheEntry.image = this.originalImage;
    }
    
    destroy() {
      this.isDestroyed = true;
      this.stop();
    }
  }

  // Traverse DOM up to find Excalidraw class instance
  function findExcalidrawInstance() {
    const canvas = document.querySelector('.excalidraw__canvas.interactive');
    if (!canvas) return null;
    const key = Object.keys(canvas).find(k => k.startsWith('__reactFiber$'));
    if (!key) return null;
    let fiber = canvas[key];
    while (fiber) {
      if (fiber.stateNode && !(fiber.stateNode instanceof HTMLElement) && !(fiber.stateNode instanceof Window)) {
        if (fiber.stateNode.imageCache) {
          return fiber.stateNode;
        }
      }
      fiber = fiber.return;
    }
    return null;
  }

  function hookImageCache(app) {
    if (app.imageCache && !app.imageCache.isHookedByExcaliGif) {
      app.imageCache.isHookedByExcaliGif = true;
      const originalSet = app.imageCache.set;
      
      app.imageCache.set = function(fileId, cacheEntry) {
        const res = originalSet.apply(this, arguments);
        if (cacheEntry && cacheEntry.mimeType === 'image/gif') {
          if (!activeGifs.has(fileId)) {
            console.log("[ExcaliGif] Hooked new GIF fileId:", fileId);
            activeGifs.set(fileId, new GifPlayer(fileId, cacheEntry, app));
          } else {
            const player = activeGifs.get(fileId);
            player.cacheEntry = cacheEntry;
            
            // Check if the image source changed from the placeholder to a real URL
            if (cacheEntry.image && cacheEntry.image.src && cacheEntry.image.src !== player.lastSrc) {
              console.log("[ExcaliGif] Image source changed for fileId:", fileId, ". Re-initializing...");
              player.originalImage = cacheEntry.image;
              player.init();
            }
            
            if (isEnabled && player.activeCanvas) {
              cacheEntry.image = player.activeCanvas;
            }
          }
        }
        return res;
      };
      
      // Scan existing GIF cache entries
      for (const [fileId, cacheEntry] of app.imageCache.entries()) {
        if (cacheEntry && cacheEntry.mimeType === 'image/gif' && !activeGifs.has(fileId)) {
          console.log("[ExcaliGif] Hooked existing GIF fileId:", fileId);
          activeGifs.set(fileId, new GifPlayer(fileId, cacheEntry, app));
        }
      }
    }
  }

  function scanAndCleanupGifs() {
    if (!currentApp) return;
    const elements = currentApp.api ? currentApp.api.getSceneElements() : [];
    const activeFileIds = new Set(elements.filter(e => e.type === 'image').map(e => e.fileId));
    
    for (const [fileId, player] of activeGifs.entries()) {
      const cacheEntry = currentApp.imageCache.get(fileId);
      if (!activeFileIds.has(fileId) || !cacheEntry) {
        console.log("[ExcaliGif] Cleaning up player for fileId:", fileId);
        player.destroy();
        activeGifs.delete(fileId);
      }
    }
  }

  function checkInstance() {
    const app = findExcalidrawInstance();
    if (app && app !== currentApp) {
      console.log("[ExcaliGif] Hooked Excalidraw instance!");
      currentApp = app;
      hookImageCache(app);
    }
    scanAndCleanupGifs();
  }

  // Poll for Excalidraw instance
  setInterval(checkInstance, 1000);

  // Listen for Toggle Event from Content Script
  document.addEventListener('ExcaliGifToggleState', (e) => {
    const targetEnabled = e.detail.enabled;
    if (isEnabled === targetEnabled) return;
    isEnabled = targetEnabled;
    console.log("[ExcaliGif] Enabled state toggled to:", isEnabled);
    
    if (isEnabled) {
      for (const player of activeGifs.values()) {
        player.start();
      }
    } else {
      for (const player of activeGifs.values()) {
        player.stop();
      }
    }
    
    if (currentApp) {
      currentApp.triggerRender(true);
    }
  });

  // Listen for Query Status Event from Content Script
  document.addEventListener('ExcaliGifQueryStatus', () => {
    const reply = {
      connected: !!currentApp,
      enabled: isEnabled,
      activeGifCount: activeGifs.size
    };
    document.dispatchEvent(new CustomEvent('ExcaliGifStatusResponse', { detail: reply }));
  });
})();
