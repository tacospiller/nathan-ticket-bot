const request = require('request');
const http = require('http');
const requestPromise = require('./request-promise');

class HttpSession {
    constructor() {
        this.init();
    }

    init() {
        if (!this.cookieJar) {
            this.cookieJar = request.jar();
        }

        if (!this.agent) {
            this.agent = new http.Agent({
                keepAlive: true,
                maxSockets: 1,
                keepAliveMsecs: 5000
            });
        }

        this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36';
    }

    async get(url) {
        const options = {
            url: url,
            method: 'GET',
            jar: this.cookieJar,
            agent: this.agent,
            headers: {
                'Cache-Control': 'max-age=0',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': this.userAgent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            },
        };
        return requestPromise(options);
    }

    async post(url, payload, referer, origin) {
        const options = {
            url: url,
            method: 'POST',
            jar: this.cookieJar,
            agent: this.agent,
            headers: {
                'Content-Length': Buffer.byteLength(payload),
                'Accept': '*/*',
                'Origin': origin,
                'X-Requested-With': 'XMLHttpRequest',
                'User-Agent': this.userAgent,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Referer': referer,
            },
            body: payload,
        };
        return requestPromise(options);
    }

    async getCookies(url) {
        return new Promise((resolve, reject) => {
            console.log('hi');
            this.cookieJar.getCookies(url, (err, cookies) => {
                console.log('hi');
                if (err) reject(err);
                else resolve(cookies);
            });
        });
    }
}

module.exports = HttpSession;
