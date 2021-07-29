const axios = require('axios');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const getInstaLink = async (id) => {
    const artistURL = `https://open.spotify.com/artist/${id}`;
    let resp = await axios.get(artistURL);
    let data = resp.data;
    const dom = new JSDOM(data);
    let temp = dom.window.document.querySelectorAll('script')[5].textContent;
    let temp2 = temp.replace(/\s/g, '');
    let temp3 = temp2.replace("Spotify={};Spotify.Entity=", '');
    let temp4 = temp3.substr(0, temp3.length - 1)
    let finalJson = JSON.parse(temp4);
    let externalLinks = finalJson.artist.profile.externalLinks.items;
    let instaLink = externalLinks.filter(item => item.name === "INSTAGRAM");
    if (instaLink.length > 0) {
        console.log(instaLink[0].url);
        return instaLink[0].url;
    }
    else {
        console.log(false);
        return false
    }
}

getInstaLink("2oTKVerbNO0kejs87fV4jA");