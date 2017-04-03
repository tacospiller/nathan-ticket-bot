const CONFIG = require('./config');
const telegram = require('./telegram');
const utils = require('./utils');
const gallCrawler = require('./gall-crawler');
const _ = require('lodash');

function onConfig(cmd) {
    if (cmd.args.length == 1) {
        telegram.sendMessage(cmd.chatId,['@' + cmd.sender + ' ' + cmd.args[0],': ',JSON.stringify(CONFIG.get(cmd.args[0]))].join(''));
    } else if (cmd.args.length == 2) {
        CONFIG.set(cmd.args[0], JSON.parse(cmd.args[1]));
        telegram.sendMessage(cmd.chatId,['@' + cmd.sender + ' ' + cmd.args[0],' => ', JSON.stringify(CONFIG.get(cmd.args[0]))].join(''));

    }
}

function onHere(cmd) {
    CONFIG.set('chatId', cmd.chatId);
    telegram.sendMessage(cmd.chatId, '안녕.');
}

function onFind(cmd) {
    const dates = [];
    const showNames = [];
    const shows = CONFIG.get('shows');
    const newShows = [];
    cmd.args.forEach((a) => {
        const parsedDate = utils.parseDate(a);
        if (parsedDate) {
            dates.push(parsedDate);
        } else {
            const splits = a.split(',');
            showNames.push(...splits);
        }
    });
    if (dates.length > 0) {
        dates.forEach((d) => {
            newShows.push({
                showName: showNames,
                date: d
            });
        })
    } else {
        newShows.push({ showName: showNames });
    }
    shows.push(...newShows);
    CONFIG.set('shows', shows);
    newShows.forEach((d) => {
        telegram.sendMessage(cmd.chatId, ['@',cmd.sender,' ',utils.formatShow(d), '이지? 찾아볼게.'].join(''));
    });
}

function onWhatFind(cmd) {
    const shows = CONFIG.get('shows');
    const showString = shows.map((s) => {
        return utils.formatShow(s);
    }).join('\n\r');
    console.log(showString);
    telegram.sendMessage(cmd.chatId, '*찾고 있는 공연은...*\r\n' + showString, 'Markdown');
}

function onDontFind(cmd) {
    const shows = CONFIG.get('shows');

    const dates = [];
    const showNames = [];
    cmd.args.forEach((a) => {
        const parsedDate = utils.parseDate(a);
        if (parsedDate) {
            dates.push(parsedDate);
        } else {
            showNames.push(a);
        }
    });

    const newShows = _.filter(shows, (s) => {
        if (_.intersection(showNames, s.showName).length > 0) {
            if (dates.length > 0) {
                if (_.some(dates, (d) => {
                    return d.month == s.date.month && d.day == s.date.day;
                })) {
                    telegram.sendMessage(cmd.chatId, utils.formatShow(s) + '는 그만 찾을게.');
                    return false;
                }
            } else {
                telegram.sendMessage(cmd.chatId, utils.formatShow(s) + '는 그만 찾을게.');
                return false;
            }
        }
        return true;
    });

    CONFIG.set('shows', newShows);
}

function onComment(cmd) {
    if (cmd.replyTo) {
        cmd.replyTo.entities.forEach((e) => {
            if (e.type === 'url') {
                const url = cmd.replyTo.text.substring(e.offset, e.offset + e.length);
                if (url.includes(CONFIG.get('gallHost'))) {
                    gallCrawler.reply(url, cmd.args.join(' '), cmd.chatId, cmd.messageId);
                    return;
                }
            }
        })
    } else {
        if (cmd.args.length > 1) {
            if (cmd.args[0].includes(CONFIG.get('gallHost'))) {
                gallCrawler.reply(cmd.args[0], cmd.args.slice(1).join(' '), cmd.chatId, cmd.messageId);
                return;
            }
        }
    }
    telegram.sendMessage(cmd.chatId, '뭔가 잘못된 것 같아.', undefined, cmd.messageId);
}

function hello(cmd) {
    telegram.sendMessage(cmd.chatId, '@' + cmd.sender+ ' 안녕.');
}

function bye(cmd) {
    telegram.sendMessage(cmd.chatId, '@' + cmd.sender+ ' 잘 있어.', undefined, undefined, () => { process.exit(0); });
}

telegram.on('/here', onHere);
telegram.on('/config', onConfig);
telegram.on('/hi', hello);
telegram.on('/bye', bye);
telegram.on('/찾아줘', onFind);
telegram.on('/뭐찾아', onWhatFind);
telegram.on('/찾지마', onDontFind);
telegram.on('/댓글', onComment);