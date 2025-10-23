console.log("YouTube Playlist Buttons: content script loaded");

// YouTube command execution for playlist operations
function executeYouTubeCommand(action) {
  const getAddVideoParams = (videoId) => ({
    clickTrackingParams: "",
    commandMetadata: { webCommandMetadata: { sendPost: true, apiUrl: "/youtubei/v1/browse/edit_playlist" } },
    playlistEditEndpoint: { playlistId: "WL", actions: [{ addedVideoId: videoId, action: "ACTION_ADD_VIDEO" }] }
  });
  
  const getRemoveVideoParams = (videoId) => ({
    clickTrackingParams: "",
    commandMetadata: { webCommandMetadata: { sendPost: true, apiUrl: "/youtubei/v1/browse/edit_playlist" } },
    playlistEditEndpoint: { playlistId: "WL", actions: [{ action: "ACTION_REMOVE_VIDEO_BY_VIDEO_ID", removedVideoId: videoId }] }
  });

  const sendActionToNativeYouTubeHandler = (getParams) => {
    const location = new URL(window.location.href);
    const appElement = document.querySelector("ytd-app");
    let videoId = location.searchParams.get("v");

    if (location.pathname.startsWith("/shorts/")) {
      videoId = location.pathname.split("/")[2];
    }

    if (!videoId || !appElement) {
      return;
    }
  
    const event = new window.CustomEvent('yt-action', {
      detail: {
        actionName: 'yt-service-request',
        returnValue: [],
        args: [{ data: {} }, getParams(videoId)],
        optionalAction: false,
      }
    });
  
    appElement.dispatchEvent(event);
  };

  try {
    if (action === "add-to-watch-later") {
      sendActionToNativeYouTubeHandler(getAddVideoParams);
    }
    if (action === "remove-from-watch-later") {
      sendActionToNativeYouTubeHandler(getRemoveVideoParams);
    }
  } catch (error) {
    console.warn("Error while sending message to native YouTube handler", error);
  }
}

// Listen for custom events from player buttons
window.addEventListener('youtube-plus-watch-later', (event) => {
  console.log('[YouTube Playlist Buttons] Received watch later event:', event.detail);
  executeYouTubeCommand(event.detail.action);
});

// Listen for other playlist-related events if needed
window.addEventListener('youtube-plus-playlist-action', (event) => {
  console.log('[YouTube Playlist Buttons] Received playlist action event:', event.detail);
  executeYouTubeCommand(event.detail.action);
});

// X Icons functionality (runs on all pages)
function addXIcons() {
  const items = document.querySelectorAll('ytd-playlist-video-renderer');
  items.forEach(item => {
    if (item.querySelector('.ytp-x-icon')) return;

    const menu = item.querySelector('#menu');
    if (!menu) return;

    const xIcon = document.createElement('span');
    xIcon.className = 'ytp-x-icon';
    xIcon.innerHTML = '&#10005;';
    xIcon.title = 'Remove';
    xIcon.style.cursor = 'pointer';
    xIcon.onclick = (e) => {
      e.stopPropagation();
      const menuButton = item.querySelector('#button[aria-label], #button[aria-haspopup]');
      if (menuButton) {
        menuButton.click();
        setTimeout(() => {
          const menuPopup = document.querySelector('ytd-menu-popup-renderer[role="menu"]');
          if (menuPopup) {
            // Check if we're in watch later playlist
            const isWatchLater = window.location.pathname.includes('/playlist') && 
                                 (window.location.search.includes('list=WL') || 
                                  document.querySelector('ytd-playlist-header-renderer h1')?.textContent?.includes('Watch later'));
            
            let removeItem;
            if (isWatchLater) {
              // Original behavior for watch later
              removeItem = Array.from(menuPopup.querySelectorAll('tp-yt-paper-item, ytd-menu-service-item-renderer'))
                .find(el => el.textContent && el.textContent.trim().toLowerCase().includes('remove from watch later'));
            } else {
              // New behavior for other playlists - find any "Remove from" option
              removeItem = Array.from(menuPopup.querySelectorAll('tp-yt-paper-item, ytd-menu-service-item-renderer'))
                .find(el => el.textContent && el.textContent.trim().toLowerCase().includes('remove from'));
            }
            
            if (removeItem) {
              removeItem.click();
            } else {
              item.remove();
            }
          } else {
            item.remove();
          }
        }, 100);
      } else {
        item.remove();
      }
    };

    const saveIcon = document.createElement('span');
    saveIcon.className = 'ytp-save-icon';
    saveIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 100%; height: 100%;"><path fill="currentColor" d="M18 4v15.06l-5.42-3.87-.58-.42-.58.42L6 19.06V4h12m1-1H5v18l7-5 7 5V3z"></path></svg>`;
    saveIcon.title = 'Save to playlist';
    saveIcon.style.cursor = 'pointer';
    saveIcon.style.marginRight = '8px';
    saveIcon.onclick = (e) => {
      e.stopPropagation();
      const menuButton = item.querySelector('#button[aria-label], #button[aria-haspopup]');
      if (menuButton) {
        menuButton.click();
        setTimeout(() => {
          const menuPopup = document.querySelector('ytd-menu-popup-renderer[role="menu"]');
          if (menuPopup) {
            const saveItem = Array.from(menuPopup.querySelectorAll('tp-yt-paper-item, ytd-menu-service-item-renderer'))
              .find(el => el.textContent && el.textContent.trim().toLowerCase().includes('save to playlist'));
            if (saveItem) {
              saveItem.click();
            }
          }
        }, 100);
      }
    };

    menu.parentNode.insertBefore(saveIcon, menu);
    if (saveIcon.nextSibling) {
      menu.parentNode.insertBefore(xIcon, saveIcon.nextSibling);
    } else {
      menu.parentNode.appendChild(xIcon);
    }
  });
}

// Initialize playlist icons functionality
addXIcons();
const xIconsObserver = new MutationObserver(addXIcons);
xIconsObserver.observe(document.body, { childList: true, subtree: true });

// CSS styles for playlist icons
const playlistIconsStyle = document.createElement('style');
playlistIconsStyle.textContent = `
  .ytp-x-icon {
    font-size: 20px;
    color: #888;
    margin-left: 12px;
    margin-right: 12px;
    vertical-align: middle;
    transition: color 0.2s;
  }
  .ytp-x-icon:hover {
    color: #f00;
  }
  .ytp-save-icon {
    font-size: 20px;
    color: #888;
    margin-right: 20px;
    vertical-align: middle;
    transition: color 0.2s;
  }
  .ytp-save-icon:hover {
    color: #f00;
  }
`;
document.head.appendChild(playlistIconsStyle);

console.log('[YouTube Plus] Playlist icons module loaded');
