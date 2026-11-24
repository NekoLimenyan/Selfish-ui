# Selfish UI

A sleek **Glassmorphism** theme for Spotify (Spicetify) featuring custom photo/GIF wallpapers, dynamic accent colors, and an interactive 3D fullscreen mode with an audio frequency visualizer.

![Selfish UI Preview](assets/preview.png)

## ✨ Features

- **Frosted Glassmorphism:** Translucent panels with customizable blur intensity (0% to 100%).
- **Custom Backgrounds (Photo & GIF):** Upload your own wallpapers stored locally in IndexedDB, with a quick-switch history bar, or use the built-in animated gradient.
- **Dual Accent Color Modes:**
  - **Fixed:** Pick any neon or pastel shade using the interactive spectrum canvas or HEX input.
  - **Adaptive:** Automatically extracts the dominant accent color from your wallpaper or current track cover.
- **3D Fullscreen Player (Alt + F):** Interactive cover tilt, ambient cover glow, auto-hiding UI after 3 seconds of inactivity, and a real-time mirrored frequency visualizer.

## 🚀 Installation

### Via Spicetify Marketplace (Recommended)

1. Open **Marketplace** in Spotify.
2. Navigate to the **Themes** tab.
3. Search for **Selfish UI**.
4. Click **Install**.

### Manual Installation

Clone the repository:

```bash
git clone https://github.com/NekoLimenyan/Selfish-ui.git
```

Copy the theme into your Spicetify Themes directory:

```powershell
cp -r Selfish-ui "$(spicetify config-dir)/Themes/Selfish-ui"
```

Apply the theme:

```powershell
spicetify config current_theme Selfish-ui color_scheme Dark inject_theme_js 1
spicetify apply
```

## ⌨️ Controls

| Shortcut | Action |
|:---:|:---|
| <kbd>Alt</kbd> + <kbd>F</kbd> | Toggle 3D Fullscreen Player |

## 🛠️ Customization

Selfish UI provides several customization options:

- Adjust background blur intensity.
- Upload custom photo and GIF wallpapers.
- Switch between fixed and adaptive accent colors.
- Choose colors using the spectrum picker or HEX input.
- Enjoy an animated gradient background without uploading custom images.

## 📋 Requirements

- **Spotify Desktop**
- **Spicetify**
- A compatible version of Spotify supported by Spicetify.

## 📄 License

This project is open-source. License information will be provided in the repository.
