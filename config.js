const Configstore = require('configstore');

const CONFIG = {
    telegramToken: '353171001:AAFn9dBEOoDo8QgO5-9PM1mjj5iw-8U4qog',
    gallHost: 'http://gall.dcinside.com',
    gallPath: '/board/lists/?id=',
    gallName: 'theaterM',
    keywords: ['ㅇㄷㄱㅁㅇ'],
    chatId: 36384770,
    shows: [],
};



module.exports = new Configstore('nathan-ticket-bot', CONFIG);