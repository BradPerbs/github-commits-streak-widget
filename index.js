const express = require('express');
const request = require('request');
const moment = require('moment');
require('dotenv').config();

const app = express();

const port = 5000;

app.get('/streak/:user', async function (req, res) {
    const yesterdaysDate = moment().subtract(1, 'day').format('YYYY-MM-DD');
    try {
        const streakCountTotal = await checkUserCommitForDate(req.params.user, yesterdaysDate);
        res.send({ streakCountTotal });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }

});

async function checkUserCommitForDate(user, date) {
    const authorOptions = {
        url: `https://api.github.com/search/commits?q=author:${user}+author-date:${date}`,
        headers: {
            'User-Agent': 'request',
            'Accept': 'application/vnd.github.cloak-preview',
            'Authorization': `token ${process.env.GITHUB_SECRET_ACCESS_TOKEN}`
        }
    };
    const committerOptions = {
        url: `https://api.github.com/search/commits?q=committer:${user}+committer-date:${date}`,
        headers: {
            'User-Agent': 'request',
            'Accept': 'application/vnd.github.cloak-preview',
            'Authorization': `token ${process.env.GITHUB_SECRET_ACCESS_TOKEN}`
        }
    };

    const githubAuthorResponse = await promisify(request)(authorOptions);
    const githubCommitterResponse = await promisify(request)(committerOptions);

    const githubAuthorCount = Number(JSON.parse(githubAuthorResponse.body).total_count);
    const githubCommitterCount = Number(JSON.parse(githubCommitterResponse.body).total_count);

    if (isNaN(githubAuthorCount) || isNaN(githubAuthorCount)) {
        throw new Error('GitHub contribution count was not a number. Body of response was:', githubAuthorResponse.body);
    } else if (githubAuthorCount + githubCommitterCount > 0) {
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
                if (err) {
                    console.log('error', err);

                    return reject(err);
                }
                resolve(result);
            });
        });
    };
};

app.listen(port, function () {
    console.log('listening on port', port);
});