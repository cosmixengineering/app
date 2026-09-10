const https = require('https');

const options = {
    headers: {
        'User-Agent': 'Node.js'
    }
};

https.get('https://api.github.com/repos/bilalk990/ssguru-property-app/actions/runs/22957150927/artifacts', options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            console.log(JSON.stringify(JSON.parse(data), null, 2));
        } catch (e) {
            console.log(data);
        }
    });
});
