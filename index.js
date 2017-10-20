const express = require('express');
const request = require('request');
const moment = require('moment');

const app = express();

const port = 5000;

var options = {
    url: 'https://api.github.com/search/commits?q=author:km-poonacha+author-date:2017-08-28',
    headers: {
        'User-Agent': 'request',
        'Accept': 'application/vnd.github.cloak-preview'
    }
};

app.get('/streak/:user', async function (req, res) {
    const yesterdaysDate = moment().subtract(1, 'day').format('YYYY-MM-DD');
    const streakCountTotal = await checkUserCommitForDate(req.params.user, yesterdaysDate);
    res.send({ streakCountTotal });
});

async function checkUserCommitForDate(user, date) {
    const options = {
        url: `https://api.github.com/search/commits?q=author:${user}+author-date:${date}`,
        headers: {
            'User-Agent': 'request',
            'Accept': 'application/vnd.github.cloak-preview'
        }
    };

    const githubResponse = await promisify(request(options));

    if (JSON.parse(githubResponse).total_count > 0) {
        const previousDaysDate = moment(date).subtract(1, 'day').format('YYYY-MM-DD');
        let streakCounter = await checkUserCommitForDate(user, previousDaysDate);
        streakCounter++;
        console.log('streakCounter', streakCounter);
        return streakCounter;
    } else {
        return 0;
    }
}

function promisify(fn) {
    return function (...args) {
        return new Promise((resolve, reject) => {
            fn(...args, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    };
};

app.listen(port, function () {
    console.log('listening on port', port);
});