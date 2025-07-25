console.log("YouTube Plus: content script loaded");

// Removed autoSelectHighestQuality feature

function addWatchLaterButton() {
  try {
    const topLevelButtons = document.getElementById('top-level-buttons-computed');
    if (!topLevelButtons) {
      console.warn('[YouTube Plus] top-level-buttons-computed not found');
      return;
    }

    if (document.getElementById('ytp-watch-later-btn')) {
      // Already replaced
      return;
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
      console.warn('[YouTube Plus] Share button not found');
      return;
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
      console.warn('[YouTube Plus] Icon div not found in Share button');
    }
    // Set the button text to 'Later'
    const textDiv = btn.querySelector('.yt-spec-button-shape-next__button-text-content');
    if (textDiv) {
      textDiv.textContent = 'Later';
      textDiv.style.marginLeft = '4px';
    } else {
      console.warn('[YouTube Plus] Text div not found in Share button');
    }

    btn.onclick = async (e) => {
      e.stopPropagation();
      const player = document.getElementById('movie_player');
      if (!player || typeof player.getVideoData !== 'function') {
        console.error('[YouTube Plus] Player or getVideoData not found');
        return;
      }
      const videoId = player.getVideoData().video_id;
      if (!videoId) {
        console.error('[YouTube Plus] videoId not found');
        return;
      }
      try {
        await fetch(`https://www.youtube.com/watch?v=${videoId}&action_add_to_watch_later=1`, {
          credentials: 'include',
          method: 'POST',
          headers: {
            'x-youtube-client-name': '1',
            'x-youtube-client-version': '2.20201021.03.00',
          },
        });
        if (iconDiv) iconDiv.innerHTML = '✔️';
        setTimeout(() => {
          if (iconDiv) iconDiv.innerHTML = `<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" pointer-events=\"none\" style=\"vertical-align: middle; margin-top: 2px;\"><circle cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" stroke-width=\"2\" fill=\"none\"/><path d=\"M12 7v5l4 2\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/></svg>`;
          if (textDiv) textDiv.textContent = 'Later';
        }, 1500);
      } catch (e) {
        if (iconDiv) iconDiv.innerHTML = '❌';
        setTimeout(() => {
          if (iconDiv) iconDiv.innerHTML = `<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" pointer-events=\"none\" style=\"vertical-align: middle; margin-top: 2px;\"><circle cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" stroke-width=\"2\" fill=\"none\"/><path d=\"M12 7v5l4 2\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/></svg>`;
          if (textDiv) textDiv.textContent = 'Later';
        }, 1500);
        console.error('[YouTube Plus] Failed to add to Watch Later', e);
      }
    };

    // Replace the Share button with the Watch Later button
    shareBtn.parentNode.replaceChild(btn, shareBtn);
    console.log('[YouTube Plus] Replaced Share button with Later button');

    // Find the first .yt-spec-touch-feedback-shape__fill div
    const fillDiv = topLevelButtons.querySelector('.yt-spec-touch-feedback-shape__fill');
    if (!fillDiv) {
      console.warn('[YouTube Plus] .yt-spec-touch-feedback-shape__fill not found');
      return;
    }

    // Remove the first .yt-spec-touch-feedback-shape__fill div (Clip button)
    if (fillDiv) {
      fillDiv.parentNode.removeChild(fillDiv);
      console.log('[YouTube Plus] Removed .yt-spec-touch-feedback-shape__fill (Clip button)');
    }

    // Insert the Watch Later button after the fillDiv
    fillDiv.parentNode.insertBefore(btn, fillDiv.nextSibling);
    console.log('[YouTube Plus] Inserted Watch Later button after .yt-spec-touch-feedback-shape__fill');

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
  } catch (err) {
    console.error('[YouTube Plus] Error in addWatchLaterButton:', err);
  }
}

function injectLaterButton() {
  // Avoid duplicate buttons
  if (document.getElementById('ytp-later-btn')) return;

  // Try to find a good place to inject the button (for regular videos and Shorts)
  let titleContainer = document.querySelector('#above-the-fold #title');
  if (!titleContainer) {
    // Try Shorts title
    titleContainer = document.querySelector('h1.title');
  }
  if (!titleContainer) return;

  // Create the button
  const btn = document.createElement('button');
  btn.id = 'ytp-later-btn';
  btn.textContent = 'Later';
  btn.style.marginLeft = '12px';
  btn.style.padding = '6px 12px';
  btn.style.background = '#065fd4';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.borderRadius = '3px';
  btn.style.cursor = 'pointer';

  // Add click handler
  btn.addEventListener('click', () => {
    executeYouTubeCommand('add-to-watch-later');
    // Optionally, show a notification or change button state
  });

  // Inject the button
  titleContainer.appendChild(btn);
}

// Remove button functionality is now handled by the X icon only
function addRemoveButtons() {
  // No-op
}

// Observe DOM changes to handle dynamic loading
const removeButtonsObserver = new MutationObserver(addRemoveButtons);
removeButtonsObserver.observe(document.body, { childList: true, subtree: true });

// Initial run
addRemoveButtons();

// Observe for page changes (YouTube is SPA)
const injectLaterButtonObserver = new MutationObserver(() => {
  injectLaterButton();
});
injectLaterButtonObserver.observe(document.body, { childList: true, subtree: true });

// Observe for player controls and video changes
const controlsInterval = setInterval(() => {
  const controls = document.querySelector('.ytp-right-controls');
  if (controls) {
    addWatchLaterButton();
    injectLaterButtonObserver.observe(controls, { childList: true, subtree: true });
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

    // Insert the X icon before the menu
    menu.parentNode.insertBefore(xIcon, menu);
  });
}

// Run on page load
addXIcons();

// Observe for dynamic changes (YouTube uses SPA navigation)
const xIconsObserver = new MutationObserver(addXIcons);
xIconsObserver.observe(document.body, { childList: true, subtree: true });

// Add some CSS for the X icon
const style = document.createElement('style');
style.textContent = `
  .ytp-x-icon {
    font-size: 20px;
    color: #888;
    margin-right: 12px;
    vertical-align: middle;
    transition: color 0.2s;
  }
  .ytp-x-icon:hover {
    color: #f00;
  }
`;
document.head.appendChild(style);