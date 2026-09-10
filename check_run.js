const https = require('https');

const options = {
    headers: {
        'User-Agent': 'Node.js',
        'Accept': 'application/vnd.github.v3+json'
    }
};

function checkRun() {
    https.get('https://api.github.com/repos/bilalk990/ssguru-property-app/actions/runs?per_page=1', options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                const run = parsed.workflow_runs[0];
                console.log(`Run ${run.id}: ${run.status} - ${run.conclusion}`);
                if (run.status !== 'completed') {
                    setTimeout(checkRun, 10000);
                } else {
                    console.log('Finished. Run ID:', run.id);
                    process.exit(0);
                }
            } catch (e) {
                console.error(e);
            }
        });
    });
}

checkRun();
