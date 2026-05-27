const fs = require('fs');

const cookies = [
    {
        "domain": ".youtube.com",
        "expirationDate": 1812530946.31319,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "g.a0009gh3uVXU0RAlBuDEjvl7foEneSxICZS_RQ5G_wqR8iatDQL2WQAFdUuKcKsxCJiwF_zYFAACgYKAccSARMSFQHGX2Mi3W9wqFSaZEfgr9f9n7M2fBoVAUF8yKo5jGsDq2Rn6qmihE7qznYU0076"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1811418579.554922,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSIDTS",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "sidts-CjQBhkeRd8bbgeMIsAPhpDaD0CAO50xxn2tJQWNgdiLUBYwKnXViCQ_VlzEIQK6UIy4Lou7BEAA"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1812530946.311505,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SAPISID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "sYu4AuN5ysSsiYhX/AS8J7bhojWyWS2mre"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1811418579.555176,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSIDCC",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "AKEyXzUtR84t-MbOHPUCwxN9-m7ux3pXBko89WIcH8KvkwcaaiZTnL8vhstQLOlPbaUuzuiQ9X8"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1812530946.311181,
        "hostOnly": false,
        "httpOnly": true,
        "name": "SSID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "AXqm2xH5k5iu65CaK"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1812530946.311658,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__Secure-1PAPISID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "sYu4AuN5ysSsiYhX/AS8J7bhojWyWS2mre"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1812530946.31303,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "g.a0009gh3uVXU0RAlBuDEjvl7foEneSxICZS_RQ5G_wqR8iatDQL2-_9RlX3I59_Y42-XMpJdiAACgYKAUcSARMSFQHGX2Mikp4fTmMvB0EcpsP1AwYJFBoVAUF8yKoypKXziO-G6dxvQLnagO080076"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1812530946.311812,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__Secure-3PAPISID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "sYu4AuN5ysSsiYhX/AS8J7bhojWyWS2mre"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1811418579.555229,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSIDCC",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "AKEyXzWyVEJjqK147ZZa33WSVJrnUk0BPs6sNhuna1YossWuph2Awi0IfcBYXKvC1Ls8Ha22utw"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1811418579.555032,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSIDTS",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "sidts-CjQBhkeRd8bbgeMIsAPhpDaD0CAO50xxn2tJQWNgdiLUBYwKnXViCQ_VlzEIQK6UIy4Lou7BEAA"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1791149289.682267,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-BUCKET",
        "path": "/",
        "sameSite": "lax",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "CH4"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1807135911.502146,
        "hostOnly": false,
        "httpOnly": true,
        "name": "LOGIN_INFO",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "AFmmF2swRgIhANd6kyikqV8k0pDMacma8bgVPg97A6lEmImJOavIJfmnAiEAp3gVZBsc_huIzdAF6TUuZkzAY3y-teEXuwK8jz8SB2g:QUQ3MjNmd2RHcktkWHg2cDZTMDE3eUY0VW03OHRoVXZOX0hFWHl2TndOTThhZnlpYV90M21IN3czRUthNlVTbFBXZW5tcERGN0FHWUxOUWV0VXR5dVBFOXBaV2F1VTgxNkVyWGNiNm11bTktclNiQkVsYWlEaDJjLTBBcWIwRWJkaW0wM0NlLS1NT19vQjhLZjJUZ0wxcVNnRUlIMVg3WU53"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1814440663.779741,
        "hostOnly": false,
        "httpOnly": false,
        "name": "PREF",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "f6=40000000&tz=Asia.Calcutta&f7=150&f5=30000&f4=4000000"
    }
];

let netscapeContent = "# Netscape HTTP Cookie File\n# This is a generated file!  Do not edit.\n\n";

cookies.forEach(c => {
    const domain = c.domain;
    const includeSubDomain = domain.startsWith('.') ? "TRUE" : "FALSE";
    const path = c.path;
    const secure = c.secure ? "TRUE" : "FALSE";
    const expirationDate = c.expirationDate ? Math.floor(c.expirationDate) : 0;
    const name = c.name;
    const value = c.value;
    
    netscapeContent += `${domain}\t${includeSubDomain}\t${path}\t${secure}\t${expirationDate}\t${name}\t${value}\n`;
});

fs.writeFileSync("yt2009_modified/back/cookies.txt", netscapeContent);
console.log("cookies.txt created successfully in yt2009_modified/back/!");
