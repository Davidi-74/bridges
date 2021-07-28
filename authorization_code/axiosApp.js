require('dotenv').config();

const express = require('express'); // Express web server framework
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const client_id = process.env.CLIENT_ID; // Your client id
const client_secret = process.env.CLIENT_SECRET; // Your secret
const redirect_uri = 'http://localhost:8000/callback'; // Your redirect uri
const axios = require('axios')

const generateRandomString = (length) => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

const stateKey = 'spotify_auth_state';
const app = express();

app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser());

app.get('/login', (req, res) => {
    const state = generateRandomString(16);
    res.cookie(stateKey, state);
    const scope = 'user-read-private user-read-email playlist-read-private';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }))
})

app.get('/callback', (req, res) => {
    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect('#' +
            querystring.stringify({
                error: 'state_mismatch'
            }))
    }
    else {
        res.clearCookie(stateKey);
        const authConfig = {
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            data: querystring.stringify({
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code',
            }),
            headers: {
                'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret)).toString('base64')
            },
            json: true
        }

        axios(authConfig)
            .then((response) => {
                // console.log(response);
                if (response.status === 200) {
                    // console.log(response);
                    const access_token = response.data.access_token;
                    const refresh_token = response.data.refresh_token;
                    console.log({ access_token, refresh_token });
                    const authConfig = {
                        method: 'get',
                        url: 'https://api.spotify.com/v1/me',
                        headers: { 'Authorization': 'Bearer ' + access_token },
                        json: true
                    }

                    axios(authConfig)
                        .then((response) => {
                            // console.log(response);
                        })
                        .catch(error => {
                            console.log(error);
                        })

                    const playlistsConfig = {
                        method: 'get',
                        url: 'https://api.spotify.com/v1/users/davidishohat/playlists?limit=50',
                        headers: { 'Authorization': 'Bearer ' + access_token },
                        json: true
                    }

                    axios(playlistsConfig)
                        .then((response) => {
                            const body = response.data;
                            let publicPlaylists = body.items.filter(item => item.public)
                            // console.log(publicPlaylists);
                            let playlistsData = publicPlaylists.map(item => ({
                                name: item.name,
                                id: item.id,
                                description: item.description,
                                images: item.images,
                                tracks: item.tracks,
                                uri: item.uri,
                                url: item.external_urls.spotify
                            }))
                            console.log(playlistsData[0]);
                        })
                        .catch(error => {
                            console.log(error);
                        })

                    res.redirect('/#' +
                        querystring.stringify({
                            access_token: access_token,
                            refresh_token: refresh_token
                        }))
                }
                else {
                    res.redirect('/#' +
                        querystring.stringify({
                            error: 'invalid_token'
                        }))
                }
            })
    }
})

app.get('/refresh_token', (req, res) => {
    // requesting access token from refresh token
    const refresh_token = req.query.refresh_token;
    const authConfig = {
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
        data: querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        }),
        json: true
    }

    axios(authConfig)
        .then((response) => {
            if (response.status === 200) {
                const access_token = response.data.access_token;
                res.send({
                    'access_token': access_token
                })
            }
        })
        .catch(error => {
            console.log(error);
        })
})

console.log('Listening on 8000');
app.listen(8000)