window.onload = function () {
    const videoPlayer = document.querySelector('video');
    var comments = document.getElementById('allCommentsList');
    if (comments != null) {
        setTimestamp(comments);
    }
    if (videoPlayer != null) {
        const controls = document.querySelector("#velocity-controls-package");
        videoPlayer.addEventListener('loadeddata', function () {
            getOrUpdatePlaybackValue(this, '');
            chrome.storage.local.get(['cr_title_timestamp'], function (result) {
                skipRecapButton(videoPlayer, result.cr_title_timestamp);
            });
        });
        controls.addEventListener('mousemove', function () {
            const button = document.querySelector('#cr-skip-recap-button');
            button.style.display = "inline-block";
            setTimeout(function () {
                button.style.display = "none";
            }, 4000);
        });
        controls.addEventListener('mouseleave', function () {
            const button = document.querySelector('#cr-skip-recap-button');
            button.style.display = "none";
        });
        document.addEventListener('keydown', function (e) {
            e.preventDefault();
            chrome.storage.local.get(['cr_title_timestamp'], function (result) {
                videoControls(videoPlayer, e, result.cr_title_timestamp);
            });
        });
    }
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
    if (comments) {
        function extractTimestamp(text) {
            var ind = text.search(/[0-9]:[0-5][0-9]/g);
            return ind;
        }
        for (var i = 0; i < comments.children.length; i++) {
            const comment = comments.children[i].innerText;
            var timestamp_index = extractTimestamp(comment);
            if (timestamp_index != -1) {
                var timestamp = comment.substring(timestamp_index,
                    timestamp_index + 4);
                console.log(timestamp);
                var seconds = 0;
                seconds += 60 * parseInt(timestamp[0]);
                seconds += 10 * parseInt(timestamp[2]);
                seconds += parseInt(timestamp[3]);
                chrome.storage.local.set({ "cr_title_timestamp": seconds }, function () {
                    console.log('Value is set to ' + seconds);
                });
                return;
            }
        }
    }
};

function skipRecapButton(videoPlayer, timestamp) {
    console.log("Reached skip recap button function");
    const button = document.createElement('button');
    button.id = 'cr-skip-recap-button';
    const text = document.createTextNode("Skip Recap");
    text.opacity = "100%";
    button.append(text);
    button.style.fontSize = '16px';
    button.style.fontWeight = 'bold';
    button.style.width = '120px';
    button.style.height = '40px';
    button.style.color = '#ffffff';
    button.style.position = 'absolute';
    button.style.zIndex = 11;
    button.style.bottom = '90px';
    button.style.right = '1%';
    button.style.background = "black";
    button.style.opacity = "50%";
    button.style.cursor = "pointer";
    button.style.border = "3px solid black";
    button.onclick = function () {
        videoPlayer.currentTime = timestamp;
    }
    document.querySelector("#velocity-controls-package").append(button);
}

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

