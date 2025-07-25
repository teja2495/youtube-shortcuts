# YouTube Shortcuts

A Chrome extension that enhances your YouTube experience by adding useful shortcuts and removing unnecessary buttons.

## What it does

### 🎥 Video Player Page Enhancements

1. **Replaces "Share" button with "Watch Later" button**
   - The Share button is replaced with a convenient "Watch Later" button
   - You can always copy the URL manually, so the Share button is redundant
   - One-click access to add videos to your Watch Later playlist

2. **Removes the "Clip" button**
   - Eliminates the rarely-used Clip button from the video player
   - Makes the "Save to Playlist" button more accessible
   - Cleaner, less cluttered interface

### 📋 Watch Later Playlist Improvements

3. **Adds quick action buttons**
   - **Remove button (X icon)**: Instantly remove videos from Watch Later without opening the 3-dot menu
   - **Save to Playlist button**: Quick access to save videos to other playlists
   - No more clicking through menus for common actions

## Features

- **Seamless Integration**: Works with YouTube's existing interface
- **Keyboard Shortcuts**: Supports YouTube's native keyboard shortcuts
- **Dynamic Updates**: Automatically adapts to YouTube's interface changes
- **Performance Optimized**: Lightweight and doesn't slow down YouTube

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

- **On video pages**: Look for the "Later" button where the Share button used to be
- **On Watch Later playlist**: Look for X (remove) and save icons next to each video
- **No additional setup required**: The extension activates automatically on YouTube

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

### Performance issues?
- The extension is designed to be lightweight
- If you experience slowdowns, try refreshing the page
- Check if other extensions might be conflicting

## Contributing

Feel free to submit issues or pull requests to improve the extension!

## License

This project is open source. Feel free to modify and distribute as needed.

## Changelog

### Version 1.0
- Initial release
- Watch Later button replacement
- Clip button removal
- Quick action buttons for Watch Later playlist
- Support for YouTube's dynamic interface updates 