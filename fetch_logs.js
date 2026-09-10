const https = require('https');

const options = {
    headers: {
        'User-Agent': 'Node.js'
    }
};

https.get('https://api.github.com/repos/bilalk990/ssguru-property-app/actions/runs?per_page=1', options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const runs = JSON.parse(data);
        const runId = runs.workflow_runs[0].id;

        https.get(`https://api.github.com/repos/bilalk990/ssguru-property-app/actions/runs/${runId}/jobs`, options, (res2) => {
            let data2 = '';
            res2.on('data', chunk => data2 += chunk);
            res2.on('end', () => {
                const jobs = JSON.parse(data2);
                const failedJob = jobs.jobs.find(j => j.conclusion === 'failure');
                if (failedJob) {
                    console.log(`FAILED_JOB_ID: ${failedJob.id}`);
                } else {
                    console.log('No failed jobs found.');
                }
            });
        });
    });
});
