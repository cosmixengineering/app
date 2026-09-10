const https = require('https');

const options = {
    headers: {
        'User-Agent': 'Node.js',
        'Accept': 'application/vnd.github.v3+json'
    }
};

const runId = '22957150927';

https.get(`https://api.github.com/repos/bilalk990/ssguru-property-app/actions/runs/${runId}/jobs`, options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            const failedJob = parsed.jobs.find(j => j.conclusion === 'failure');
            if (failedJob) {
                console.log('Failed Job ID:', failedJob.id);
                console.log('Log URL:', `https://api.github.com/repos/bilalk990/ssguru-property-app/actions/jobs/${failedJob.id}/logs`);
            } else {
                console.log('No failed jobs found or rate limited.');
                console.log(JSON.stringify(parsed).substring(0, 500));
            }
        } catch (e) {
            console.error(e);
            console.log(data);
        }
    });
});
