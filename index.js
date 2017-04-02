const gallCrawler = require('./gall-crawler'); // begin crawl
require('./telegram-cmds');
const telegram = require('./telegram');

gallCrawler.init();
telegram.init();
//telegram.getUpdates();