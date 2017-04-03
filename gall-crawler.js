const request = require('request');
const url = require('url');
const cheerio = require('cheerio');
const _ = require('lodash');
const randomWords = require('random-words');
const telegram = require('./telegram');
const utils = require('./utils');
const CONFIG = require('./config');
const querystring = require('querystring');
const cookieClient = require('cookie-client');

const http = require('http');

let LAST_POST = 0;

module.exports = {
    init: () => {
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
                    //console.log('Beginning crawl from post ' + LAST_POST);
                    //module.exports.crawl();                        
                });
    },

    matchShow: (show, str) => {
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
    },

    reply: (url, message, chatId, origMessage) => {
        
        var agent = new http.Agent({
            keepAlive: true,
            maxSockets: 1,
            keepAliveMsecs: 5000
        });

        const o = {
            url: url,
            agent: agent,
            headers: {
                    'Cache-Control': 'max-age=0',
                    'Upgrade-Insecure-Requests': '1',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    //'Accept-Encoding': 'gzip, deflate, sdch',
                    //'Accept-Language': 'ko-KR,ko;q=0.8,en-US;q=0.6,en;q=0.4'
                },
        };
        
        request(o, (error, response, body) => {
            if (error) {
                console.log(error);
                telegram.sendMessage(chatId, '댓글 달기 실패', undefined, origMessage);
                return false;
            }

            const cookieJar = new cookieClient();
            cookieJar.addFromHeaders(response.headers, {
                domain: 'dcinside.com',
            });
            
            let $ = cheerio.load(body);
            const requestBody = {};
            $('form#comment_write input[type="hidden"]').each((i, e) => {
                requestBody[$(e).attr('name')] = $(e).val();
            });

            requestBody['name'] = 'ㅇㅇ';
            requestBody['password'] = randomWords();
            requestBody['memo'] = message;

            requestBody['cur_t'] = $("#cur_t").val();
            requestBody['id'] = $("#id").val();
            requestBody['no'] = $("#no").val();
            requestBody['best'] = 'undefined';
            requestBody['best_pno'] = 'undefined';
            requestBody['best_origin'] = '';
            requestBody['check_6'] = $('#check_6').val();
            requestBody['check_7'] = $('#check_7').val();
            requestBody['check_8'] = $('#check_8').val();
            requestBody['campus'] = '0';
            requestBody['recommend'] = '0';
            requestBody['code'] = 'undefined';
            requestBody['user_ip'] = $('#user_ip').val();

            let cookieString = 'siteUniqId=STU_58d6793cpspvTMwN; ' 
                + cookieJar.cookieStringForRequest(CONFIG.get('gallHost'), '/forms/comment_submit', false);
            cookieString += '; __utmt=1; lately_cookie=theaterM%7C%uC5F0%uADF9%2C%20%uBBA4%uC9C0%uCEEC%7C8; __utma=118540316.1840529439.1490450732.1491148807.1491151122.5; __utmb=118540316.6.10.1491151122; __utmc=118540316; __utmz=118540316.1490542821.3.3.utmcsr=gall.dcinside.com|utmccn=(referral)|utmcmd=referral|utmcct=/theaterM/2025357';

            const payload = querystring.stringify(requestBody);
            const options = {
                host: 'gall.dcinside.com',
                path: '/forms/comment_submit',
                method: 'POST',
                headers: {
                    'Content-Length': Buffer.byteLength(payload),
                    'Accept': '*/*',
                    'Origin': 'http://gall.dcinside.com',
                    'X-Requested-With': 'XMLHttpRequest',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Referer': url,
                    //'Accept-Encoding': 'gzip, deflate',
                    //'Accept-Language': 'ko-KR,ko;q=0.8,en-US;q=0.6,en;q=0.4',
                    'Cookie': cookieString,
                },
                agent: agent,
            }
            console.log(options.headers.Cookie);
            console.log(payload);
            let resp = '';
            const req = http.request(options, (response) => {
                response.on('data', (d) => {
                    resp += d;
                });

                response.on('end', () => {
                    console.log(resp);
                })
            });

            req.write(payload,
            'UTF-8');
            req.end();

/*
            request(options, (error, response, body) => {
                if (error) {
                    console.log(error);
                    return;
                }
                if (!parseInt(body, 10)) {
               //     console.log(body);
                //    console.log(JSON.stringify(requestBody));
                 //   console.log(querystring.stringify(requestBody));
                    telegram.sendMessage(chatId, '문제가 있는 것 같은데. 패스워드는 ' + requestBody.password + '이야.' + body, undefined, origMessage);
                    return;
                }
                console.log(body);
                console.log(JSON.stringify(requestBody));
                telegram.sendMessage(chatId, '댓글을 잘 보냈어. 패스워드는 ' + requestBody.password + '이야.', undefined, origMessage);
            })*/
        })
    },

    crawl: () => {
        try {
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
                                return module.exports.matchShow(s, e.title);
                            }))
                        );
                    });
                    _.forEach(filteredtitles, (t) => {
                        telegram.sendMessage(CONFIG.get('chatId'), t.title + ' ' + CONFIG.get('gallHost') + t.link);
                    });
                    setTimeout(module.exports.crawl, 1000);
                });
        } catch (e) {
            console.log(e);
            setTimeout(module.exports.crawl, 1000);
        }
    }
}