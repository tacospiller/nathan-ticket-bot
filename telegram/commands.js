const Telegram = require('./api-wrapper');

module.exports = {
    '/hi': async(cmd) => {
        const payload = {
            text: '안녕.',
            chat_id: cmd.message.chat.id,
        };
        return telegram.sendMessage(payload);
    },
    
    '/bye': async(cmd) => {
        const payload = {
            text: '잘 있어.',
            chat_id: cmd.message.chat.id,
        };
        await telegram.sendMessage(payload);
        process.exit();
    },
}