const request = require('request');
const url = require('url');
const cheerio = require('cheerio');
const _ = require('lodash');
const telegram = require('./telegram');
const utils = require('./utils');
const CONFIG = require('./config');
let LAST_POST = 0;

function init() {
 request(CONFIG.get('gallHost') + CONFIG.get('gallPath') + CONFIG.get('gallName'),
        (error, response, body) => {
            let $ = cheerio.load(body);
            $('td.t_subject a').each((i, e) => {
                const link = url.parse($(e).attr('href'), true);
                const no = parseInt(link.query.no);
                if (link.query.no && LAST_POST < no) {
                    LAST_POST = no;
            }
            });
            console.log('Beginning crawl from post ' + LAST_POST);
            crawl();                        
        });
}

function matchShow(show, str) {
    if (!_.some(show.showName, (k) => {
        return str.includes(k);
    })) {
        return false;
    }
    if (show.date) {
        const d = utils.parseDate(str);
        if (!d || d.month !== show.date.month || d.day !== show.date.day) {
            return false;
        }
    }
    if (show.daynight) {
        if (!str.includes(show.daynight)) {
            return false;
        }
    }
    return true;
}

function crawl() {
    request(CONFIG.get('gallHost') + CONFIG.get('gallPath') + CONFIG.get('gallName'),
        (error, response, body) => {
            let $ = cheerio.load(body);
            const titles = [];
            let recentPost = LAST_POST;
            $('td.t_subject a').each((i, e) => {
                const link = url.parse($(e).attr('href'), true);
                const no = parseInt(link.query.no);
                if (link.query.no && no > LAST_POST) {
                    if (recentPost < no) {
                        recentPost = no; 
                    }
                    titles.push({
                        link: $(e).attr('href'),
                        title: $(e).text(),
                    });
                }
            });
            LAST_POST = recentPost;
            const filteredtitles = _.filter(titles, (e) => {
                return (
                    (CONFIG.get('keywords').length === 0 || 
                     _.some(CONFIG.get('keywords'), (k) => {
                        return e.title.includes(k);
                    })) && 
                    (CONFIG.get('shows').length === 0 ||
                     _.some(CONFIG.get('shows'), (s) => {
                         return matchShow(s, e.title);
                     }))
                );
            });
            _.forEach(filteredtitles, (t) => {
                telegram.sendMessage(CONFIG.get('chatId'), t.title + ' ' + CONFIG.get('gallHost') + t.link);
            });
            setTimeout(crawl, 1000);
        });

}

init();
