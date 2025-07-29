# YouTube Watch Later Shortcuts

A Chrome extension that enhances your YouTube experience by adding convenient shortcuts for managing your Watch Later playlist and other playlists directly from the video player and playlist pages.

## What it does

### 🎥 Video Player Page Enhancements

1. **Custom "Watch Later" button**
   - Adds a dedicated "Watch Later" button to the video player controls
   - One-click access to add videos to your Watch Later playlist
   - Positioned in the right controls area for easy access

2. **Custom "Save to Playlist" button**
   - Adds a dedicated "Save to Playlist" button to the video player controls
   - Quick access to save videos to your playlists
   - Automatically triggers YouTube's native save dialog

3. **Smart Button Placement**
   - Buttons are intelligently positioned in the video player controls
   - Automatically adapts to YouTube's interface changes
   - Works with both regular videos and YouTube Shorts

### 📋 Playlist Page Improvements

4. **Quick Action Icons**
   - **Remove button (X icon)**: Instantly remove videos from playlists without opening the 3-dot menu
   - **Save to Playlist button**: Quick access to save videos to other playlists
   - Icons appear next to each video in playlist views
   - No more clicking through menus for common actions

## Features

- **Seamless Integration**: Works with YouTube's existing interface
- **Dynamic Updates**: Automatically adapts to YouTube's interface changes and navigation
- **Performance Optimized**: Lightweight and doesn't slow down YouTube
- **Smart Detection**: Automatically detects page changes and video player updates
- **Cross-Page Support**: Works on video pages, playlist pages, and YouTube Shorts

## Installation

### Method 1: Manual Installation (Recommended)

1. **Download the extension**
   - Download this repository as a ZIP file
   - Extract the ZIP file to a folder on your computer

2. **Enable Developer Mode**
   - Open Chrome and go to `chrome://extensions/`
   - Toggle on "Developer mode" in the top right corner

3. **Load the extension**
   - Click "Load unpacked" button
   - Select the folder you extracted from the ZIP file

4. **Start using**
   - Refresh any open YouTube tabs
   - The extension will automatically activate on YouTube pages

### Method 2: From Source Code

If you have the source code:

```bash
# Clone the repository
git clone [repository-url]
cd youtube-shortcuts

# Follow steps 2-4 from Method 1 above
```

## Usage

Once installed, the extension works automatically:

- **On video pages**: Look for the "Watch Later" and "Save to Playlist" buttons in the video player controls
- **On playlist pages**: Look for X (remove) and save icons next to each video
- **No additional setup required**: The extension activates automatically on YouTube
- **Works with YouTube Shorts**: Buttons appear in Shorts player as well

## Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Chromium-based browsers (Edge, Brave, etc.)
- ❌ Firefox (requires different manifest format)
- ❌ Safari (requires different extension format)

## Technical Details

- **Manifest Version**: 3
- **Content Scripts**: Automatically injects on YouTube pages
- **Permissions**: Only requires access to YouTube domains
- **No background scripts**: Lightweight and privacy-friendly
- **Mutation Observers**: Intelligently detects interface changes
- **URL Change Detection**: Automatically adapts to YouTube's navigation

## Troubleshooting

### Extension not working?
1. Make sure Developer mode is enabled in Chrome extensions
2. Refresh the YouTube page after installation
3. Check the browser console for any error messages
4. Try disabling and re-enabling the extension

### Buttons not appearing?
1. Wait a few seconds for the page to fully load
2. Navigate to a different YouTube page and back
3. Check if YouTube has updated their interface
4. Try refreshing the page

### Performance issues?
- The extension is designed to be lightweight
- If you experience slowdowns, try refreshing the page
- Check if other extensions might be conflicting

## Contributing

Feel free to submit issues or pull requests to improve the extension!

## License

This project is open source. Feel free to modify and distribute as needed.

## Changelog

### Version 2.0
- Added custom "Watch Later" button to video player
- Added custom "Save to Playlist" button to video player
- Enhanced playlist page with quick action icons
- Improved URL change detection and navigation handling
- Better support for YouTube Shorts
- Optimized performance and reliability

### Version 1.0
- Initial release
- Basic playlist functionality
- Support for YouTube's dynamic interface updates 