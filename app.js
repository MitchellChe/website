const express = require('express');
const app = express();
const fetch = require('node-fetch');
const { response } = require('express');
require('dotenv').config();

const port = process.env.PORT || 3000;
app.listen(port, ()=> console.log(`Starting server at ${port}`));

app.use(express.static('public'));
app.use(express.json({limit:'500kb'}));

app.get('/api/song', async (req, response)=>{

    console.log('Listen Status Request Made');
    const data = await getMySongData();

    response.json(data);
    
});

const clientID = process.env.CLIENT_ID;
const secret = process.env.CLIENT_SECRET;
var refreshToken = process.env.REFRESH_TOKEN;
var authToken = '';
var ccToken = '';
var currentSong = '';
var recentlyPlayed = '';

async function getMySongData(){

    try{
        currentSong = await getCurrentSong(authToken);
    }

    //Fetching current song gives below error after I don't listen to something for a while-need to find permanent fix for error but this works for now
    //FetchError: invalid json response body at https://api.spotify.com/v1/me/player/currently-playing reason: Unexpected end of JSON input
    catch(error){
        currentSong = '';
        recentlyPlayed = await getRecentlyPlayed(authToken);
        console.log(error);
    }
    return {currentSong,recentlyPlayed};

}

async function getCurrentSong(token){

    const result = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        method: 'GET',
        headers: {'Authorization' : 'Bearer '+token}
    });

    const data = await result.json();
    console.log(data);

    if(!result.ok&&result.status==401){
        authToken = await refreshAuthToken();
        getCurrentSong(authToken);
    }
    else if(!result.ok){
        console.log(result);
        console.log('hello');
        throw new Error(result.status);
    }
    else{
        return data;
    }
}

async function getRecentlyPlayed(token){

    const result = await fetch('https://api.spotify.com/v1/me/player/recently-played', {
        method: 'GET',
        headers: {'Authorization' : 'Bearer '+token}
    });
    const data = await result.json();
    if(!result.ok&&result.status==401){
        authToken = await refreshAuthToken();
        getRecentlyPlayed(authToken);
    }
    else if(!result.ok){
        throw new Error(result.status)
    }
    else{
        return data;
    }
}

async function refreshAuthToken(){

    console.log('refreshing token');

    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type':'application/x-www-form-urlencoded',
            'Authorization' : 'Basic ' + Buffer.from(clientID + ':' + secret).toString('base64')
        },
        body: 'grant_type=refresh_token&refresh_token='+refreshToken

    }).catch(function(error){
        console.log(error);
    });

    const data = await result.json();
    return data.access_token;
}

(async function(){
    authToken = await refreshAuthToken();
    ccToken = await getCCToken();
})();


//PopSong functions

// Token for CC auth flow, not for accessing user info
async function getCCToken(){      

    const token_URL = 'https://accounts.spotify.com/api/token';
    console.log('getting cc token')                      
    const result = await fetch(token_URL, {
        method: 'POST',
        headers: {
            'Content-Type':'application/x-www-form-urlencoded',
            'Authorization' : 'Basic ' + Buffer.from(clientID + ':' + secret).toString('base64') //<base 64 encoded client id:client secret string>
        },
        body: 'grant_type=client_credentials'
    }).catch(function(error){
        console.log(error);
    });

    const data = await result.json();
    return data.access_token;
}

app.post('/spotifyAPI/tracks', async (request, response)=>{

    console.log('Fetch Request Made');
    const ids = request.body.ids;

    try{
        const data = await fetchSpotifyTracks(ids);
        response.json(data);
    }
    catch(error){
        console.log(error);
        response.json({error:'error in request'});
    }
    
    
});

async function fetchSpotifyTracks(ids){


    const result = await fetch(`https://api.spotify.com/v1/tracks/?ids=${ids}`, {
        method: 'GET',
        headers: {'Authorization' : 'Bearer '+ccToken}
    });
    const data = await result.json();
    if(!result.ok&&result.status==401){
        ccToken = await getCCToken();
        fetchSpotifyTracks(ids);
    }
    else if(!result.ok){
        throw new Error(result)
    }
    else{
        return data;
    }

}

