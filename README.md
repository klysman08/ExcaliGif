# ExcaliGif 🎨✨

> **Per-Element Animated GIF & Custom Motion Flows for Excalidraw**

**ExcaliGif** is a feature-rich browser extension that brings your Excalidraw canvas to life. Version 2.0 introduces a selective **in-canvas floating toolbar** that lets you choose exactly which lines or arrows to animate, and tune their style, speed, size, spacing, direction, and glow independently! It also provides full real-time playback for animated GIF files.

---

## 🚀 Features in v2.0

### 1. In-Canvas Tuning Toolbar (New!)
Select any arrow or line element on the canvas to reveal the **ExcaliGif floating toolbar**. Assign, toggle, or tune flow parameters on the fly without leaving your canvas:
* **Opt-in per element**: Animations only apply to elements you explicitly choose.
* **Independent tuning**: Different lines can have different styles, directions, and speeds simultaneously.
* **Collapsible tuning panel**: Click the gear (`⚙️`) icon to reveal slider and pill controls.

### 2. 6 Beautiful Motion Styles
* **Particles (●)**: Smooth dot flows traveling along paths.
* **Marching Ants (⋯)**: Stylized dashed borders in motion.
* **Gradient Pulse (◐)**: Premium glowing gradient sweeps that flow like liquid neon energy.
* **Ripple Wave (◎)**: Concentric expanding ripple rings radiating down the paths.
* **Packet Train (▸▸)**: Oriented chevron-shaped data packets flowing in sequence.
* **Snake Trail (∿)**: Tapered trails that slither and fade along paths.

### 3. Granular Element Tuning
* **Direction**: Forward (`→`), Reverse (`←`), or Bounce (`↔`) (ping-pong animation).
* **Speed**: slow, medium, or fast motion factors.
* **Element Size**: Scale range from `1` to `5`.
* **Spacing**: Gap distance between flow elements from `20px` to `120px`.
* **Glow Intensity**: Bloom levels (`None`, `Subtle`, `Med`, `Strong`).

### 4. Real-time GIF Playback
* Drag and drop any `.gif` file to watch it render loops on the board.
* Control playback speed multipliers (0.5×, 1×, 1.5×, 2×) from the extension popup dashboard.

---

## 🛠️ Installation

1. **Download the source code:** Clone this repository or extract it from a ZIP.
2. **Open Extensions Page:** In Google Chrome, navigate to `chrome://extensions/`.
3. **Enable Developer Mode:** Toggle the **Developer mode** switch in the top-right corner.
4. **Load Unpacked:** Click **Load unpacked** and select this directory.
5. **Start Sketching:** Go to [excalidraw.com](https://excalidraw.com) and draw some arrows or import a GIF!

---

## 🧩 How It Works (Technical Details)

ExcaliGif injects a script into the page context (`MAIN` world) to access the underlying canvas and react context:

1. **React Fiber Hooking:** It traverses the DOM starting from `.excalidraw__canvas.interactive` to find its React Fiber node (`__reactFiber$...`), climbing up to locate the active Excalidraw stateNode which manages the canvas state.
2. **Image Cache Interception:** It hooks the Excalidraw `imageCache.set` method. When an image with the MIME type `image/gif` is stored, ExcaliGif intercepts it.
3. **GIF Decoding (omggif.js):** The raw GIF bytes are fetched and decoded frame-by-frame. Each frame is painted on a separate HTML canvas, tracking the animation delay (using a modified port of the `omggif` decoder).
4. **Active Canvas Swap:** The static `HTMLImageElement` in Excalidraw's cache is replaced with a single dynamic `HTMLCanvasElement` managed by the extension.
5. **Floating Toolbar & Canvas Overlay:** The extension overlays a secondary `<canvas>` aligned with the interactive canvas. Selecting an element triggers the DOM injection of the floating toolbar panel. Real-time offsets are recalculated per frame on the overlay.
6. **State Persistence:** Element settings (style, speed, size, spacing, glow, direction) are mapped to element IDs and persisted in `localStorage`. They are automatically loaded when refreshing the page. Deleted elements are cleaned up from the store.

---

## 🌐 Showcase & Demo Page

To experience a simulator of this extension and play around with retro sound effects and pixel styles, check out our [GitHub Pages Showcase Site](https://klysman08.github.io/ExcaliGif).

---

## 🌌 Sister Project: AstroFocus GIFs

Need a steady source of animated pixel art or sprites to add to your Excalidraw board? Check out our sister project [AstroFocus GIFs](https://gifs.astrofocus.app/) — a curated search engine and library of high-quality pixel-art animations, sprites, and transparent loops!

---

## 📄 License

This project is licensed under the MIT License.
