console.log("YouTube Plus: content script loaded");

// Only run watch later button logic on watch pages
if (location.href.includes('/watch')) {
  console.log('[YouTube Plus] Watch page detected, initializing Watch Later and Save buttons');
  
  let watchLaterInterval = null;
  let lastUrl = location.href;
  let buttonProcessed = false;

  function resetButtonState() {
    buttonProcessed = false;
    if (watchLaterInterval) {
      clearInterval(watchLaterInterval);
      watchLaterInterval = null;
    }
    console.log('[YouTube Plus] Button state reset for navigation');
  }

  function detectUrlChange() {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      console.log('[YouTube Plus] Navigation detected:', lastUrl, '->', currentUrl);
      lastUrl = currentUrl;
      
      resetButtonState();
      
      if (currentUrl.includes('/watch')) {
        setTimeout(() => {
          console.log('[YouTube Plus] Starting buttons for new watch page');
          startWatchLaterInterval();
        }, 1000);
      } else {
        console.log('[YouTube Plus] Navigated away from watch page, stopping');
      }
      
      return true;
    }
    return false;
  }

  function startWatchLaterInterval() {
    if (watchLaterInterval || buttonProcessed) return;
    
    console.log('[YouTube Plus] Starting watch later and save buttons interval');
    watchLaterInterval = setInterval(() => {
      const added = addCustomButtons();
      if (added) {
        clearInterval(watchLaterInterval);
        watchLaterInterval = null;
        buttonProcessed = true;
        console.log('[YouTube Plus] Custom buttons added successfully');
      }
    }, 500);
    
    // Safety timeout
    setTimeout(() => {
      if (watchLaterInterval) {
        clearInterval(watchLaterInterval);
        watchLaterInterval = null;
        console.log('[YouTube Plus] Safety timeout reached, clearing interval');
      }
    }, 30000);
  }

function triggerSaveToPlaylist() {
  try {
    // Find the specific Save button by its attributes
    const saveButton = document.querySelector('button[title="Save"][aria-label="Save to playlist"]');
    
    if (saveButton) {
      saveButton.click();
      console.log('[YouTube Plus] Clicked Save to playlist button');
      return;
    }
    
    // Fallback: try to find by aria-label only
    const saveButtonFallback = document.querySelector('button[aria-label="Save to playlist"]');
    if (saveButtonFallback) {
      saveButtonFallback.click();
      console.log('[YouTube Plus] Clicked Save to playlist button (fallback)');
      return;
    }
    
    // Additional fallback: find by class and title
    const saveButtonByClass = Array.from(document.querySelectorAll('button.yt-spec-button-shape-next')).find(
      btn => btn.title === 'Save' || btn.getAttribute('aria-label') === 'Save to playlist'
    );
    
    if (saveButtonByClass) {
      saveButtonByClass.click();
      console.log('[YouTube Plus] Clicked Save to playlist button (class fallback)');
      return;
    }
    
    console.warn('[YouTube Plus] Save to playlist button not found');
    
  } catch (error) {
    console.error('[YouTube Plus] Error triggering save to playlist:', error);
  }
}

  function addCustomButtons() {
    try {
      // Find the right controls container
      const rightControls = document.querySelector('.ytp-right-controls');
      if (!rightControls) {
        console.log('[YouTube Plus] Right controls not found');
        return false;
      }

      // Find the subtitles button
      const subtitlesButton = rightControls.querySelector('.ytp-subtitles-button');
      if (!subtitlesButton) {
        console.log('[YouTube Plus] Subtitles button not found');
        return false;
      }

      // Check if we already added the custom buttons
      const existingWatchLaterBtn = rightControls.querySelector('#ytp-custom-watch-later-btn');
      const existingSaveBtn = rightControls.querySelector('#ytp-custom-save-btn');
      
      if (existingWatchLaterBtn && existingSaveBtn) {
        console.log('[YouTube Plus] Custom buttons already exist');
        return true;
      }

      console.log('[YouTube Plus] Adding custom Watch Later and Save buttons');

      // Create the Watch Later button first (will be leftmost)
      if (!existingWatchLaterBtn) {
        const watchLaterBtn = document.createElement('button');
        watchLaterBtn.id = 'ytp-custom-watch-later-btn';
        watchLaterBtn.className = 'ytp-button';
        watchLaterBtn.title = 'Add to Watch Later';
        watchLaterBtn.setAttribute('aria-label', 'Add to Watch Later');
        watchLaterBtn.setAttribute('data-priority', '4');
        watchLaterBtn.setAttribute('data-tooltip-title', 'Add to Watch Later');
        
        // Add the watch later icon using YouTube's SVG structure
        watchLaterBtn.innerHTML = `
          <svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%" style="transform: scale(0.8);">
            <use class="ytp-svg-shadow" xlink:href="#ytp-watch-later-icon"></use>
            <path class="ytp-svg-fill" d="M18,8 C12.47,8 8,12.47 8,18 C8,23.52 12.47,28 18,28 C23.52,28 28,23.52 28,18 C28,12.47 23.52,8 18,8 L18,8 Z M16,19.02 L16,12.00 L18,12.00 L18,17.86 L23.10,20.81 L22.10,22.54 L16,19.02 Z" fill="#fff" id="ytp-watch-later-icon"></path>
          </svg>
        `;

        // Add click handler for watch later
        watchLaterBtn.onclick = (e) => {
          e.stopPropagation();
          console.log('[YouTube Plus] Watch later button clicked');
          executeYouTubeCommand('add-to-watch-later');
        };

        // Insert the watch later button before the subtitles button
        rightControls.insertBefore(watchLaterBtn, subtitlesButton);
        console.log('[YouTube Plus] Added Watch Later button');
      }

      // Create the Save button (will be to the right of Watch Later button)
      if (!existingSaveBtn) {
        const saveBtn = document.createElement('button');
        saveBtn.id = 'ytp-custom-save-btn';
        saveBtn.className = 'ytp-button';
        saveBtn.title = 'Save to playlist';
        saveBtn.setAttribute('aria-label', 'Save to playlist');
        saveBtn.setAttribute('data-priority', '4');
        saveBtn.setAttribute('data-tooltip-title', 'Save to playlist');
        
        // Add the save icon using the provided SVG structure
        saveBtn.innerHTML = `
          <svg height="100%" version="1.1" viewBox="-4 0 30 30" width="100%" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; transform: scale(0.4);">
            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
              <g transform="translate(-419.000000, -153.000000)" fill="#ffffff">
                <path d="M437,153 L423,153 C420.791,153 419,154.791 419,157 L419,179 C419,181.209 420.791,183 423,183 L430,176 L437,183 C439.209,183 441,181.209 441,179 L441,157 C441,154.791 439.209,153 437,153"></path>
              </g>
            </g>
          </svg>
        `;

        // Add click handler for save
        saveBtn.onclick = (e) => {
          e.stopPropagation();
          console.log('[YouTube Plus] Save button clicked');
          triggerSaveToPlaylist();
        };

        // Insert the save button before the subtitles button
        rightControls.insertBefore(saveBtn, subtitlesButton);
        console.log('[YouTube Plus] Added Save button');
      }
      
      return true;

    } catch (err) {
      console.error('[YouTube Plus] Error adding custom buttons:', err);
      return false;
    }
  }

  // MutationObserver for player changes
  const playerObserver = new MutationObserver((mutations) => {
    if (detectUrlChange()) return;
    
    if (!location.href.includes('/watch')) return;
    
    let shouldCheck = false;
    mutations.forEach(mutation => {
      if (mutation.target.closest('.ytp-right-controls') ||
          Array.from(mutation.addedNodes).some(node => 
            node.nodeType === 1 && (
              node.querySelector && (
                node.querySelector('.ytp-subtitles-button') ||
                node.closest('.ytp-right-controls')
              )
            )
          )) {
        shouldCheck = true;
      }
    });
    
    if (shouldCheck && !buttonProcessed) {
      setTimeout(() => {
        console.log('[YouTube Plus] Player change detected, checking for buttons');
        addCustomButtons();
      }, 100);
    }
  });

  playerObserver.observe(document.body, { childList: true, subtree: true });

  // Navigation event listeners
  window.addEventListener('popstate', () => {
    console.log('[YouTube Plus] Popstate detected');
    detectUrlChange();
  });

  const originalPushState = history.pushState;
  history.pushState = function(...args) {
    originalPushState.apply(this, args);
    setTimeout(() => detectUrlChange(), 100);
  };

  // Start initial process
  startWatchLaterInterval();
} else {
  console.log('[YouTube Plus] Not a watch page, skipping custom buttons');
}

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
            const removeItem = Array.from(menuPopup.querySelectorAll('tp-yt-paper-item, ytd-menu-service-item-renderer'))
              .find(el => el.textContent && el.textContent.trim().toLowerCase().includes('remove from watch later'));
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

addXIcons();
const xIconsObserver = new MutationObserver(addXIcons);
xIconsObserver.observe(document.body, { childList: true, subtree: true });



// CSS styles
const style = document.createElement('style');
style.textContent = `
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
  #ytp-custom-watch-later-btn, #ytp-custom-save-btn {
    margin-right: 8px;
  }
  #ytp-custom-watch-later-btn:hover, #ytp-custom-save-btn:hover {
    opacity: 0.8;
  }
`;
document.head.appendChild(style);

// YouTube command execution
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