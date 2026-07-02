import zlib
import struct
import os

# Define color mapping
COLOR_MAP = {
    '.': (0, 0, 0, 0),         # Transparent
    'k': (45, 43, 42, 255),    # Charcoal (#2D2B2A)
    'w': (255, 255, 255, 255),  # White
    'p': (140, 90, 220, 255),  # Accent Purple (#8C5ADC)
    'l': (210, 180, 255, 255),  # Light Purple Glow (#D2B4FF)
    'y': (235, 184, 90, 255),  # Gold (#EBB85A)
    's': (226, 219, 208, 255)  # Muted Grey Screen Border (#E2DBD0)
}

# The 16x16 pixel-art layout
GRID_16 = [
    ". . . k k k k k k k k k k . . .",
    ". . k k w w w w w w w w k k . .",
    ". k k w w w w w w w w w w k k .",
    ". k w w w p p w w w l w w w k .",
    ". k w w w p p p w w w w w w k .",
    ". k w w w p p p p w w y y w k .",
    ". k w w w p p p p p w y y w k .",
    ". k w w w p p p p w w w w w k .",
    ". k w w w p p p w w w w w w k .",
    ". k w w w p p w w w l w w w k .",
    ". k w w w w w w w w w w w w k .",
    ". k k s s s s s s s s s s k k .",
    ". . k k k k k k k k k k k k . .",
    ". . . . . k k k k k k . . . . .",
    ". . . . k k k k k k k k . . . .",
    ". . . k k k k k k k k k k . . ."
]

def make_png(filename, grid, scale):
    width = 16 * scale
    height = 16 * scale
    pixels = []

    # Scale the grid using nearest neighbor
    for row in grid:
        row_pixels = [char for char in row.split() if char]
        for _ in range(scale):
            for char in row_pixels:
                color = COLOR_MAP.get(char, (0, 0, 0, 0))
                for _ in range(scale):
                    pixels.append(color)

    # Compile PNG structure
    png = bytearray([137, 80, 78, 71, 13, 10, 26, 10])
    
    # IHDR
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    
    def make_chunk(tag, data):
        chunk = bytearray()
        chunk.extend(struct.pack(">I", len(data)))
        chunk.extend(tag)
        chunk.extend(data)
        chunk.extend(struct.pack(">I", zlib.crc32(tag + data) & 0xffffffff))
        return chunk

    png.extend(make_chunk(b"IHDR", ihdr_data))
    
    # IDAT
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # Filter 0
        for x in range(width):
            r, g, b, a = pixels[y * width + x]
            raw_data.extend([r, g, b, a])
            
    idat_data = zlib.compress(raw_data)
    png.extend(make_chunk(b"IDAT", idat_data))
    
    # IEND
    png.extend(make_chunk(b"IEND", b""))
    
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, "wb") as f:
        f.write(png)
    print(f"Generated {filename} (scale {scale}x, {width}x{height})")

if __name__ == "__main__":
    make_png("icons/icon16.png", GRID_16, 1)
    make_png("icons/icon48.png", GRID_16, 3)
    make_png("icons/icon128.png", GRID_16, 8)
