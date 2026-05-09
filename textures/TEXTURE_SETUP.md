# Omniverse Earth Textures Setup

## Required Textures

Place the following texture files in `public/textures/`:

### 1. earth_color.jpg
- **Description**: NASA Blue Marble base color map
- **Resolution**: 2K minimum (2048x1024), 4K recommended
- **Source**: https://visibleearth.nasa.gov/collection/1484/blue-marble
- **Alternative**: https://www.solarsystemscope.com/textures/

### 2. earth_normal.jpg
- **Description**: Normal map for mountain/trench shadows
- **Resolution**: 2K minimum (2048x1024)
- **Source**: Same as above

### 3. earth_clouds.jpg
- **Description**: Cloud layer for atmospheric effect
- **Resolution**: 2K minimum (2048x1024)
- **Source**: Same as above

## Quick Download Instructions

### Option 1: NASA Visible Earth
1. Visit: https://visibleearth.nasa.gov/collection/1484/blue-marble
2. Download "Blue Marble: Land Surface, Ocean Color, Sea Ice, and Clouds"
3. Extract and rename files to match the names above

### Option 2: Solar System Scope (Easier)
1. Visit: https://www.solarsystemscope.com/textures/
2. Download the Earth texture pack
3. Extract files to `public/textures/`
4. Rename to match:
   - `2k_earth_daymap.jpg` → `earth_color.jpg`
   - `2k_earth_normal_map.jpg` → `earth_normal.jpg`
   - `2k_earth_clouds.jpg` → `earth_clouds.jpg`

### Option 3: Free Textures (8K Available)
1. Visit: https://planetpixelemporium.com/earth.html
2. Download Earth maps (free for non-commercial use)
3. Place in `public/textures/` and rename accordingly

## Fallback Mode

If textures are not found, the app will automatically use:
- Basic blue material for the ocean
- Transparent atmosphere
- Node grid still visible in peel-back mode

The app will NOT crash without textures - it degrades gracefully.

## File Structure

```
public/
└── textures/
	├── earth_color.jpg         ← Base map
	├── earth_normal.jpg        ← Bump map
	├── earth_clouds.jpg        ← Cloud layer
	└── README.txt              ← This file
```

## Testing

After adding textures:
1. Refresh the browser (Ctrl+Shift+R to force reload)
2. Click "Omniverse" in the Hex Navigator
3. You should see a high-quality Earth with:
   - NASA Blue Marble texture
   - Realistic cloud layer
   - Sovereign cyan atmosphere glow
   - Seismic event markers
   - Double-click to reveal node grid

## Performance Notes

- **2K textures**: Best for most systems, ~60 FPS
- **4K textures**: Recommended for NVIDIA RTX cards
- **8K textures**: Only for high-end rigs (RTX 3080+)

The visual backpressure system ensures textures only load when the Omniverse face is active.
