/*
function setBioEventListener() {
    Array.from(document.getElementsByTagName("button")).forEach(e => {
        e.addEventListener("click", bioSelect);
    });
}
*/

function bioSelect(id) {
    let button = document.getElementById(id);
	if (button.classList.contains('show'))
	{
		return;
	}
	else{
        showing = document.getElementsByClassName('show');
        showing[0].classList.remove('show');
        button.classList.add('show');
        showing[1].classList.remove('show');
        document.getElementsByClassName('fade')[0].classList.remove('fade');
        let bioTypeElement = document.getElementsByClassName(id)[0];
        if(bioTypeElement!==undefined){
            bioTypeElement.style.opacity=0.1;
            bioTypeElement.classList.add('show');
            bioTypeElement.classList.add('fade');
            fadeIn();
        }
	}
}

function fadeIn() {
    element = document.getElementsByClassName('fade')[0];
    var op = 0.1;  // initial opacity
    var timer = setInterval(function () {
        if (op >= 1){
            clearInterval(timer);
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op += op * 0.1;
    }, 10);
 }

async function loadSong(){

    const response = await fetch('/api/song');
    const songData = await response.json().catch(function(error){
        console.log(error)
        console.log("error caught");
    });

    const currentSong = songData.currentSong;
    const recentlyPlayed = songData.recentlyPlayed;

    console.log(songData);

    if(!currentSong&&currentSong.is_playing){

        document.getElementById('music-status').innerHTML="here's what I'm listening to in real time! refreshes every 30s or on page reload using spotify's API";
        const img = currentSong.item.album.images[2].url;
        const title = currentSong.item.name;
        const artist = currentSong.item.artists[0].name;
        const url = currentSong.item.external_urls.spotify;
        const preview = currentSong.item.preview_url;
        createTrackDetail(img,title,artist,url,preview);
    }
    else{
        
        document.getElementById('music-status').innerHTML="here's what I last listened to using spotify's API (not currently listening to anything)";

        const img = recentlyPlayed.items[0].track.album.images[2].url;
        const title = recentlyPlayed.items[0].track.name;
        const artist = recentlyPlayed.items[0].track.artists[0].name;
        const lastListenedTime = new Date(recentlyPlayed.items[0].played_at);
        const url = recentlyPlayed.items[0].track.external_urls.spotify;
        const preview = recentlyPlayed.items[0].track.preview_url;
        createTrackDetail(img,title,artist,url,preview,lastListenedTime.toLocaleString());

    }

    function createTrackDetail(img, title, artist, url, preview, time='') {

        const detailField = document.getElementById('music-detail');
        detailField.innerHTML = '';
        console.log(preview);

        if(preview!=null){
            const html = 
            `
            <div>
            <audio id="track_preview">
                <source src = ${preview} type="audio/mp3">
            </audio>
            <a href=${url} target="_blank">
            <img src="${img}" class="album_art" alt="album cover" onmouseover="playAudio()" onmouseout="pauseAudio()">
            </a>    
            </div>
            <div class="">
            <label for="title">${title}</label>
            </div>
            <div>
            <label for="artist">${artist}</label>
            </div> 
            <div>
            <label for="time">${time}</label>
            </div>
            `;
            detailField.insertAdjacentHTML('beforeend', html);
        }
        else{
            const html =
            `
            <div>
            <a href=${url} target="_blank">
            <img src="${img}" class="album_art" alt="album cover">
            </a>    
            </div>
            <div class="">
            <label for="title">${title}</label>
            </div>
            <div>
            <label for="artist">${artist}</label>
            </div> 
            <div>
            <label for="time">${time}</label>
            </div>
            `;
            detailField.insertAdjacentHTML('beforeend', html);
        }

    }
}

loadSong();

setInterval(loadSong,30000);