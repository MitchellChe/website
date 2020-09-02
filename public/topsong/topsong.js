var trackData = [];

initGame();

async function getCharts(){

    const proxyurl = 'https://cors-anywhere.herokuapp.com/';                   //CORS Proxy
    const url = 'https://spotifycharts.com/regional/us/daily/latest/download'; //Daily US top 200 from spotifycharts.com
    const response = await fetch(proxyurl+url);    
    const data = await response.text();
    const top200 = data.split('\n').slice(2).slice(0,200);

    return top200;

}

async function initGame(){

    const top200 = await getCharts();

    for(i=0;i<200;i++){
        trackData.push(getObj(top200[i]));
    }

    loadGame();
}

async function getTwoTracks(a,b){

    const ids = a.trackID+","+b.trackID;
    const params = {ids};
    const options = {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    };
    const response = await fetch('/spotifyAPI/tracks',options);
    const data = await response.json();
    return data;
    
}

//Function for getting track object from track array
function getObj(element){
    const arr = element.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); //Parse CSV row to string arr
    var track = {};
    track.position = parseInt(arr[0]);
    track.title = arr[1];
    track.artist = arr[2];
    track.dailyStreams = parseInt(arr[3]);
    track.trackID = arr[4].replace('https://open.spotify.com/track/','');
    return track;

}

// Shuffle array of top200 tracks using Fisher-Yates algorithm
// to randomly select 2 tracks
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function loadGame(){
    
    //Hide buttons
    document.getElementById('nextButton').classList.add('hide');
    document.getElementById('startOverButton').classList.add('hide');


    rows = shuffle(trackData);
    const tracka = rows[0];
    const trackb = rows[1];

    (async function getTrackInfo(){
    
        const data = await getTwoTracks(tracka,trackb);
        console.log(data);
        tracka.info = data.tracks[0];
        trackb.info = data.tracks[1];
        
        loadHTML(tracka,trackb);
        
    })();

    score = localStorage.getItem('score');
    if(score==null||score==0){
        score = 0;
        localStorage.setItem('score',score);
    }


}

function loadHTML(tracka, trackb){

    //Clear out divs
    const afield = document.getElementById('fielda');
    const bfield = document.getElementById('fieldb');
    afield.innerHTML = '';
    bfield.innerHTML = ''
    

    function htmlField(track,ab){

        console.log(track);
        
        // For some reason CSV from Spotify is inconsistent in using quotation marks around song name/artist
        // so just use data from API (.info) for consistency
        const html = 
        `
        <img src="${track.info.album.images[1].url}" id=${ab} class="album_art clickable" alt="${track.info.album.name} album cover">
        <br>
        <p id="track-info">
            <b>${track.info.name}</b>
            <br>
            ${track.info.artists[0].name}
        </p>
        `;
        return html;
    }

    afield.insertAdjacentHTML('beforeend',htmlField(tracka,'tracka'));
    bfield.insertAdjacentHTML('beforeend',htmlField(trackb,'trackb'));

    function getPreviews(track,ab){

        const preview_url = track.info.preview_url;
        if(preview_url==null){
            return '';
        }

        const audioPreview = ab+"_preview";
        console.log(audioPreview);
        const html = 
        `
            <audio id=${audioPreview}>
                <source src = ${preview_url} type="audio/mp3">
            </audio>
        `;

        const img = document.getElementById(ab);
        
        img.addEventListener('mouseenter',function(){
            playAudio(audioPreview);
        });
        img.addEventListener('mouseleave',function(){
            pauseAudio(audioPreview);
        });

        return html;
    }

    afield.insertAdjacentHTML('beforeend',getPreviews(tracka,'tracka'));
    bfield.insertAdjacentHTML('beforeend',getPreviews(trackb,'trackb'));


    document.getElementById('tracka').addEventListener("click",checkA);
    document.getElementById('trackb').addEventListener("click",checkB);

    function checkA(){
        if(tracka.dailyStreams>trackb.dailyStreams){

            alert('Correct!');
            document.getElementById('nextButton').classList.remove('hide');

        }
        else{

            alert('incorrect :(');
            document.getElementById('nextButton').classList.remove('hide');
            //for when score is implemented    document.getElementById('button-box').insertAdjacentHTML('afterbegin', startOverHTML);

        }
        document.getElementById('tracka').removeEventListener("click",checkA);
        document.getElementById('trackb').removeEventListener("click",checkB);
        afield.insertAdjacentHTML('beforeend',getStatField(tracka));
        bfield.insertAdjacentHTML('beforeend',getStatField(trackb));
        document.getElementById('tracka').classList.remove('clickable');
        document.getElementById('trackb').classList.remove('clickable');

    }

    function checkB(){

        if(trackb.dailyStreams>tracka.dailyStreams){

            alert('Correct!');
            document.getElementById('nextButton').classList.remove('hide');
            
        }
        else{

            alert('incorrect :(');
            document.getElementById('nextButton').classList.remove('hide');
            //for when score is implemented    document.getElementById('button-box').insertAdjacentHTML('afterbegin', startOverHTML);

        }
        document.getElementById('tracka').removeEventListener("click",checkA);
        document.getElementById('trackb').removeEventListener("click",checkB);
        afield.insertAdjacentHTML('beforeend',getStatField(tracka));
        bfield.insertAdjacentHTML('beforeend',getStatField(trackb));  
        document.getElementById('tracka').classList.remove('clickable');
        document.getElementById('trackb').classList.remove('clickable');
         
    }

    function getStatField(track){
        
        const html = 
        `
            <div class = 'track-stats'>
            <p>
                Chart Position: ${track.position}
                <br>
                Daily Streams: ${track.dailyStreams.toLocaleString()}
            </p>
            </div>
        `;
        return html;
    }
}