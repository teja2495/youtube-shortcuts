console.log("YouTube Plus: content script loaded");

// Removed autoSelectHighestQuality feature

// Observe for player controls and video changes
let watchLaterInterval = null;
function startWatchLaterInterval() {
  if (watchLaterInterval) return;
  watchLaterInterval = setInterval(() => {
    const controls = document.querySelector('.ytp-right-controls');
    if (controls) {
      const added = addWatchLaterButton();
      if (added) {
        clearInterval(watchLaterInterval);
        watchLaterInterval = null;
      }
    }
  }, 1000);
}

function addWatchLaterButton() {
  try {
    const topLevelButtons = document.getElementById('top-level-buttons-computed');
    if (!topLevelButtons) {
      // console.warn('[YouTube Plus] top-level-buttons-computed not found');
      return false;
    }

    if (document.getElementById('ytp-watch-later-btn')) {
      // Already replaced
      return true;
    }

    // Remove text from click and download buttons if present
    Array.from(topLevelButtons.querySelectorAll('button')).forEach(btn => {
      const textDiv = btn.querySelector('.yt-spec-button-shape-next__button-text-content');
      const title = btn.title?.toLowerCase() || '';
      const aria = btn.getAttribute('aria-label')?.toLowerCase() || '';
      if (title.includes('click') || aria.includes('click') || title.includes('download') || aria.includes('download')) {
        if (textDiv) textDiv.textContent = '';
      }
    });

    // Find the Share button (by title or aria-label)
    const shareBtn = Array.from(topLevelButtons.querySelectorAll('button')).find(
      btn => btn.title === 'Share' || btn.getAttribute('aria-label') === 'Share'
    );
    if (!shareBtn) {
      // console.warn('[YouTube Plus] Share button not found');
      return false;
    }

    // Clone the Share button to preserve classes and structure
    const btn = shareBtn.cloneNode(true);
    btn.id = 'ytp-watch-later-btn';
    btn.title = 'Add to Watch Later';
    btn.setAttribute('aria-label', 'Add to Watch Later');

    // Replace the icon with the Watch Later SVG (clock icon)
    const iconDiv = btn.querySelector('.yt-spec-button-shape-next__icon');
    if (iconDiv) {
      iconDiv.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" pointer-events="none" style="vertical-align: middle; margin-top: 2px;"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 7v5l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
    } else {
      // console.warn('[YouTube Plus] Icon div not found in Share button');
    }
    // Set the button text to 'Watch Later'
    const textDiv = btn.querySelector('.yt-spec-button-shape-next__button-text-content');
    if (textDiv) {
      textDiv.textContent = 'Later';
      textDiv.style.marginLeft = '4px';
    } else {
      // console.warn('[YouTube Plus] Text div not found in Share button');
    }

    btn.onclick = async (e) => {
      e.stopPropagation();
      // Use the same logic as the keyboard shortcut: executeYouTubeCommand
      executeYouTubeCommand('add-to-watch-later');
      // No icon or text change needed
    };

    // Replace the Share button with the Watch Later button
    shareBtn.parentNode.replaceChild(btn, shareBtn);
    console.log('[YouTube Plus] Replaced Share button with Later button');

    // Remove the Clip button (by aria-label or title)
    const clipBtn = Array.from(topLevelButtons.querySelectorAll('button')).find(
      btn => btn.title === 'Clip' || btn.getAttribute('aria-label') === 'Clip'
    );
    if (clipBtn) {
      clipBtn.parentNode.removeChild(clipBtn);
      console.log('[YouTube Plus] Removed Clip button');
    } else {
      // console.warn('[YouTube Plus] Clip button not found');
    }

    // Set up a MutationObserver to move the Save button when the More menu is opened
    const observeSaveButton = () => {
      const moreMenu = document.querySelector('ytd-menu-popup-renderer');
      if (!moreMenu) return;
      const observer = new MutationObserver(() => {
        const saveBtn = Array.from(moreMenu.querySelectorAll('tp-yt-paper-item, ytd-menu-service-item-renderer')).find(
          el => el.textContent && el.textContent.trim().toLowerCase() === 'save'
        );
        if (saveBtn) {
          // Move the Save button beside the Later button
          saveBtn.className = btn.className; // Use the same class as the Later button
          saveBtn.style.marginLeft = '8px';
          // Remove any menu-specific attributes
          saveBtn.removeAttribute('role');
          saveBtn.removeAttribute('tabindex');
          btn.parentNode.insertBefore(saveBtn, btn.nextSibling);
          observer.disconnect();
          console.log('[YouTube Plus] Moved Save button beside Later button');
        }
      });
      observer.observe(moreMenu, { childList: true, subtree: true });
    };
    // Listen for the More menu being opened
    document.addEventListener('click', (e) => {
      const moreBtn = Array.from(document.querySelectorAll('button')).find(
        b => b.getAttribute('aria-label')?.toLowerCase().includes('more')
      );
      if (moreBtn && moreBtn.contains(e.target)) {
        setTimeout(observeSaveButton, 100); // Wait for menu to render
      }
    });
    return true;
  } catch (err) {
    console.error('[YouTube Plus] Error in addWatchLaterButton:', err);
    return false;
  }
}

// Remove button functionality is now handled by the X icon only

// Observe for page changes (YouTube is SPA)
// Remove injectLaterButtonObserver

// Observe for player controls and video changes
const controlsInterval = setInterval(() => {
  const controls = document.querySelector('.ytp-right-controls');
  if (controls) {
    addWatchLaterButton();
    // Remove injectLaterButtonObserver.observe(controls, { childList: true, subtree: true });
    clearInterval(controlsInterval);
  }
}, 1000);

function addXIcons() {
  // Select all playlist items
  const items = document.querySelectorAll('ytd-playlist-video-renderer');
  items.forEach(item => {
    // Prevent adding multiple X icons
    if (item.querySelector('.ytp-x-icon')) return;

    // Find the menu container
    const menu = item.querySelector('#menu');
    if (!menu) return;

    // Create the X icon element
    const xIcon = document.createElement('span');
    xIcon.className = 'ytp-x-icon';
    xIcon.innerHTML = '&#10005;'; // Unicode X
    xIcon.title = 'Remove';

    // Optional: Add click handler
    xIcon.style.cursor = 'pointer';
    xIcon.onclick = (e) => {
      e.stopPropagation();
      // Find the menu button (three dots) inside the item
      const menuButton = item.querySelector('#button[aria-label], #button[aria-haspopup]');
      if (menuButton) {
        // Open the menu
        menuButton.click();
        // Wait for the menu to render
        setTimeout(() => {
          // Find the menu popup
          const menuPopup = document.querySelector('ytd-menu-popup-renderer[role="menu"]');
          if (menuPopup) {
            // Find the 'Remove from Watch Later' menu item
            const removeItem = Array.from(menuPopup.querySelectorAll('tp-yt-paper-item, ytd-menu-service-item-renderer'))
              .find(el => el.textContent && el.textContent.trim().toLowerCase().includes('remove from watch later'));
            if (removeItem) {
              removeItem.click();
            } else {
              // fallback: just remove from DOM if menu item not found
              item.remove();
            }
          } else {
            // fallback: just remove from DOM if menu popup not found
            item.remove();
          }
        }, 100); // Wait for menu to appear
      } else {
        // fallback: just remove from DOM if menu button not found
        item.remove();
      }
    };

    // Create the Save icon element
    const saveIcon = document.createElement('span');
    saveIcon.className = 'ytp-save-icon';
    // Use the provided SVG for the save icon
    saveIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 100%; height: 100%;"><path fill="currentColor" d="M18 4v15.06l-5.42-3.87-.58-.42-.58.42L6 19.06V4h12m1-1H5v18l7-5 7 5V3z"></path></svg>`;
    saveIcon.title = 'Save to playlist';
    saveIcon.style.cursor = 'pointer';
    saveIcon.style.marginRight = '8px';
    saveIcon.onclick = (e) => {
      e.stopPropagation();
      // Find the menu button (three dots) inside the item
      const menuButton = item.querySelector('#button[aria-label], #button[aria-haspopup]');
      if (menuButton) {
        menuButton.click();
        setTimeout(() => {
          const menuPopup = document.querySelector('ytd-menu-popup-renderer[role="menu"]');
          if (menuPopup) {
            // Find the 'Save to playlist' menu item
            const saveItem = Array.from(menuPopup.querySelectorAll('tp-yt-paper-item, ytd-menu-service-item-renderer'))
              .find(el => el.textContent && el.textContent.trim().toLowerCase().includes('save to playlist'));
            if (saveItem) {
              saveItem.click();
            }
          }
        }, 100);
      }
    };
    // Insert the Save icon before the X icon
    menu.parentNode.insertBefore(saveIcon, menu);
    // Insert the X icon after the Save icon
    if (saveIcon.nextSibling) {
      menu.parentNode.insertBefore(xIcon, saveIcon.nextSibling);
    } else {
      menu.parentNode.appendChild(xIcon);
    }
  });
}

// Run on page load
addXIcons();

// Observe for dynamic changes (YouTube uses SPA navigation)
const xIconsObserver = new MutationObserver(addXIcons);
xIconsObserver.observe(document.body, { childList: true, subtree: true });

function swapSaveAndDownloadButtons() {
  const flexibleButtons = document.getElementById('flexible-item-buttons');
  if (!flexibleButtons) return;
  // Find Save and Download buttons
  const saveBtn = Array.from(flexibleButtons.querySelectorAll('button')).find(
    btn => btn.title?.toLowerCase().includes('save') || btn.getAttribute('aria-label')?.toLowerCase().includes('save')
  );
  const downloadBtn = Array.from(flexibleButtons.querySelectorAll('button')).find(
    btn => btn.title?.toLowerCase().includes('download') || btn.getAttribute('aria-label')?.toLowerCase().includes('download')
  );
  if (saveBtn && downloadBtn && saveBtn.nextSibling !== downloadBtn) {
    // Check that both buttons are actually children of flexibleButtons before moving
    if (saveBtn.parentNode === flexibleButtons && downloadBtn.parentNode === flexibleButtons) {
      // Move Save button before Download button
      flexibleButtons.insertBefore(saveBtn, downloadBtn);
      console.log('[YouTube Plus] Swapped Save and Download buttons');
    }
  }
}

function removeClipButtonFromFlexibleItemButtons() {
  const flexibleButtons = document.getElementById('flexible-item-buttons');
  if (!flexibleButtons) return;
  const clipBtn = Array.from(flexibleButtons.querySelectorAll('button')).find(
    btn => btn.title === 'Clip' || btn.getAttribute('aria-label') === 'Clip'
  );
  if (clipBtn) {
    clipBtn.parentNode.removeChild(clipBtn);
    console.log('[YouTube Plus] Removed Clip button from #flexible-item-buttons');
  }
  swapSaveAndDownloadButtons();
}

// Run on page load
removeClipButtonFromFlexibleItemButtons();
// Observe for dynamic changes
const flexibleButtonsObserver = new MutationObserver(removeClipButtonFromFlexibleItemButtons);
flexibleButtonsObserver.observe(document.body, { childList: true, subtree: true });

// Add some CSS for the X icon
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
`;
document.head.appendChild(style);

// --- BEGIN: Add executeYouTubeCommand from background-ignore.js ---
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
// --- END: Add executeYouTubeCommand from background-ignore.js ---