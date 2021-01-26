window.onload = function () {
    const videoPlayer = document.querySelector('video');
    const comments = document.getElementById('allCommentsList');
    if (comments != null) {
        setTimestamp(comments);
    }
    if (videoPlayer != null) {
        videoPlayer.addEventListener('loadeddata', function () {
            getOrUpdatePlaybackValue(this, '');
        });

        document.addEventListener('keydown', function (e) {
            e.preventDefault();
            chrome.storage.local.get(['cr_title_timestamp'], function (result) {
                videoControls(videoPlayer, e, result.cr_title_timestamp);
            });
        });
    }
}

window.onunload = function () {
    chrome.storage.local.clear(function () {
        console.log("Storage cleared");
    })
}

function videoControls(videoPlayer, e, timestamp) {
    if (e.shiftKey && e.keyCode == 40 || e.shiftKey && e.keyCode == 38) {
        // Increase/decrease video player's playback speed
        let value = (e.keyCode == 40) ? -0.25 : 0.25;
        let newPlaybackRate = checkLimit(videoPlayer.playbackRate + value);
        videoPlayer.playbackRate = newPlaybackRate;
        getOrUpdatePlaybackValue(videoPlayer, newPlaybackRate);
        showPlaybackRateValue(videoPlayer, newPlaybackRate);
    }
    else if (e.shiftKey && e.keyCode == 39) {
        videoPlayer.currentTime = timestamp;
    }
    else if (e.shiftKey && e.keyCode == 82) {
        // Reset playback speed to default
        videoPlayer.playbackRate = 1.0;
        getOrUpdatePlaybackValue(videoPlayer, 1.0);
        showPlaybackRateValue(videoPlayer, 1.0);
    }
}

function setTimestamp(comments) {
    console.log("Reached function");
    if (comments) {
        function isTimestamp(text) {
            return /^[0-9]:[0-5][0-9]$/.test(text);
        }
        for (var i = 0; i < comments.children.length; i++) {
            var arr = comments.children[i].innerText.split(/\s+/g);
            for (var j = 0; j < arr.length; j++) {
                if (isTimestamp(arr[j])) {
                    var seconds = 0;
                    seconds += 60 * parseInt(arr[j][0]);
                    seconds += 10 * parseInt(arr[j][2]);
                    seconds += parseInt(arr[j][3]);
                    chrome.storage.local.set({ "cr_title_timestamp": seconds }, function () {
                        console.log('Value is set to ' + seconds);
                    });
                }
            }
        }
    }
};

function showPlaybackRateValue(videoPlayer, playbackRate) {
    const container = document.createElement('div');
    container.id = 'cr-playback-speed';
    const text = document.createTextNode(`${playbackRate}x playback speed`);
    container.append(text);
    container.style.fontSize = '12px';
    container.style.color = '#ffffff';
    container.style.position = 'absolute';
    container.style.zIndex = 1;
    container.style.top = '0px';
    container.style.right = '0px';
    container.style.margin = '5px';
    videoPlayer.parentElement.append(container);
    setTimeout(function () {
        const playbackContainer = document.querySelector('#cr-playback-speed');
        playbackContainer.remove();
    }, 500);
}

function checkLimit(playbackRate) {
    playbackRate = playbackRate < 0 ? 1.0 : playbackRate;
    playbackRate = playbackRate > 2 ? 2.0 : playbackRate;
    return playbackRate;
}

function getOrUpdatePlaybackValue(videoPlayer, playbackValue) {
    if (playbackValue) {
        localStorage.setItem('cr_playback_speed', playbackValue);
    } else {
        let existingSpeed = localStorage.getItem('cr_playback_speed');
        videoPlayer.playbackRate = (existingSpeed) === null ? 1.0 : checkLimit(existingSpeed);
    }
    return;
};

