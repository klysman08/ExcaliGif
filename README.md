# ExcaliGif 🎨✨

> **Animated GIF Support for Excalidraw Whiteboards**

**ExcaliGif** is a lightweight browser extension that brings your Excalidraw canvas to life by enabling animated GIF support directly on the whiteboard. Simply drag-and-drop or import any animated `.gif` file, and watch it play in real-time.

---

## 🚀 Features

* **Real-time GIF Playback:** No more static first-frame placeholders. GIFs play smoothly on the whiteboard canvas.
* **On/Off Animation Control:** Toggle rendering loops globally from the extension dashboard popup to save CPU resources when you need to focus.
* **Active Counter & Engine Status:** Live statistics in the popup dashboard showing the number of active GIFs currently rendering and the engine state.
* **Automatic Integration:** Seamlessly hooks into any `excalidraw.com` tab without requiring manual configuration.

---

## 🛠️ Installation

Since ExcaliGif is currently in developer preview, you can load it as an unpacked extension in Chrome:

1. **Download the source code:** Clone this repository or download it as a ZIP file and extract it.
2. **Open Extensions Page:** In Google Chrome, navigate to `chrome://extensions/`.
3. **Enable Developer Mode:** Toggle the **Developer mode** switch in the top-right corner.
4. **Load Unpacked:** Click **Load unpacked** in the top-left corner and select the root directory containing the `manifest.json` file.
5. **Start Sketching:** Go to [excalidraw.com](https://excalidraw.com) and drag and drop a GIF onto the board!

---

## 🧩 How It Works (Technical Details)

ExcaliGif injects a script into the page context (`MAIN` world) to access the underlying canvas and react context:

1. **React Fiber Hooking:** It traverses the DOM starting from `.excalidraw__canvas.interactive` to find its React Fiber node (`__reactFiber$...`), climbing up to locate the active Excalidraw stateNode which manages the canvas state.
2. **Image Cache Interception:** It hooks the Excalidraw `imageCache.set` method. When an image with the MIME type `image/gif` is stored, ExcaliGif intercepts it.
3. **GIF Decoding (omggif.js):** The raw GIF bytes are fetched and decoded frame-by-frame. Each frame is painted on a separate HTML canvas, tracking the animation delay (using a modified port of the `omggif` decoder).
4. **Active Canvas Swap:** The static `HTMLImageElement` in Excalidraw's cache is replaced with a single dynamic `HTMLCanvasElement` managed by the extension.
5. **Redraw Loop:** A render tick updates the frame of the dynamic canvas and modifies the elements' `version` attribute immutably, telling Excalidraw's engine to redraw the scene.

---

## 🌐 Showcase & Demo Page

To experience a simulator of this extension and play around with retro sound effects and pixel styles, check out our [GitHub Pages Showcase Site](https://klysman08.github.io/ExcaliGif).

---

## 🌌 Sister Project: AstroFocus GIFs

Need a steady source of animated pixel art or sprites to add to your Excalidraw board? Check out our sister project [AstroFocus GIFs](https://gifs.astrofocus.app/) — a curated search engine and library of high-quality pixel-art animations, sprites, and transparent loops!

---

## 📄 License

This project is licensed under the MIT License.
