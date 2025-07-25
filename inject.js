function setHighestQuality(retries = 5) {
  try {
    var player = window.yt && window.yt.player && window.yt.player.getPlayerByElement ? window.yt.player.getPlayerByElement('movie_player') : document.getElementById('movie_player');
    if (!player || typeof player.getAvailableQualityLevels !== 'function') return;
    var levels = player.getAvailableQualityLevels();
    if (levels && levels.length > 0) {
      // Prefer highest non-premium if premium is not available
      var highest = levels.find(l => !/premium/i.test(l)) || levels[0];
      player.setPlaybackQuality(highest);
      player.setPlaybackQualityRange && player.setPlaybackQualityRange(highest);
    }
  } catch (e) {}
  // Retry a few times in case player isn't ready
  if (retries > 0) setTimeout(() => setHighestQuality(retries - 1), 800);
}

function onPlayerStateChange(event) {
  // State 1 = playing
  if (event.data === 1) {
    setTimeout(() => setHighestQuality(3), 500);
  }
}

function hookPlayer() {
  var player = window.yt && window.yt.player && window.yt.player.getPlayerByElement ? window.yt.player.getPlayerByElement('movie_player') : document.getElementById('movie_player');
  if (player && typeof player.addEventListener === 'function') {
    player.addEventListener('onStateChange', onPlayerStateChange);
  } else if (window.yt && window.yt.player && window.yt.player.Application && window.yt.player.Application.create) {
    // For some YouTube versions
    var origCreate = window.yt.player.Application.create;
    window.yt.player.Application.create = function() {
      var inst = origCreate.apply(this, arguments);
      try {
        inst.addEventListener('onStateChange', onPlayerStateChange);
      } catch (e) {}
      return inst;
    };
  }
}

// Initial hook and periodic re-hook in case of navigation
hookPlayer();
setInterval(hookPlayer, 2000);
// Also try to set quality on initial load
setTimeout(() => setHighestQuality(5), 1200); 