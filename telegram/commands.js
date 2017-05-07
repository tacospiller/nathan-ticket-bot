const Telegram = require('./api-wrapper');
const DEFINE = require('../define');

module.exports = {
    '/hi': async(cmd) => {
        const payload = {
            text: '안녕.',
            chat_id: cmd.message.chat.id,
        };
        return Telegram.sendMessage(payload);
    },
    
    '/bye': async(cmd) => {
        const payload = {
            text: '잘 있어.',
            chat_id: cmd.message.chat.id,
        };
        await Telegram.sendMessage(payload);
        process.exit();
    },

    '/comment': async(cmd) => {
        let result = undefined;
        let error = 'unknown';

        try {
            if (cmd.args.length > 1) {
                if (cmd.args[0].includes(DEFINE.GALL_HOST)) {
                    const replyOptions = {
                        url: cmd.args[0],
                        text: cmd.args.slice(1).join(' '),
                        author: 'ㅇㅇ',
                        password: 'nathan',
                    }
                    result = await Gall.reply(replyOptions);
                }
            }
        } catch (e) {
            error = e;
        }

        const resultString = result ? '성공' : '실패';
        let text = `댓글 달기 시도. 결과: *$(resultString)*\r\n`;
        if (result) {
            text += `이름: $(result.author)\r\n` + `내용: $(result.text)\r\n` + `비밀번호: $(result.password)\r\n` + `ip: $(result.ip)\r\n`;
        }
        
        const payload = {
            chat_id: cmd.message.chat.id,
            text: text,
            parseMode: 'Markdown',
            reply_to_message_id: cmd.message.message_id,
        }

        return Telegram.sendMessage(payload);
    },
}