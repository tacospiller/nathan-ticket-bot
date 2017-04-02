const CONFIG = require('./config');
const request = require('request');
const _ = require('lodash');

let OFFSET = 0;
function getUpdates(offset, callback) {
    const payload = JSON.stringify({
        offset: offset,
        allowed_updates: ['message'],
    });
    const options = {
        url: 'https://api.telegram.org/bot' + CONFIG.get('telegramToken') + '/getUpdates',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: payload,
    };

    let newupdate = offset;
    request(options, callback);  
}

module.exports = {
    init: () => {
        getUpdates(0, (error, res, body) => {
            if (error) {
                console.log(error);
            } else {
                const jsonBody = JSON.parse(body);
                OFFSET = jsonBody.result[jsonBody.result.length - 1].update_id;
            }
            console.log('Polling Telegram updates')
            module.exports.processUpdates();
        });
    },
    sendMessage: (chatId, message, parseMode, origMessage) => {
        try {
            const payload = {
                chat_id: chatId,
                text: message,
            };
            if (parseMode) {
                payload['parse_mode'] = parseMode;
            }
            if (origMessage) {
                payload['reply_to_message_id'] = origMessage;
            }

            const options = {
                url: 'https://api.telegram.org/bot' + CONFIG.get('telegramToken') + '/sendMessage',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
            };

            request(options, (error, response, body) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log(message);
                }
            });
        } catch (e) {
            console.log(e);
            console.log('sendMessage failed');
        }
    },
    on: (command, callback) => {
        this.commandCallbacks = this.commandCallbacks || {};
        this.commandCallbacks[command] = callback;
    },
    parseCommand: (message) => {
        if (!message.text) {
            return [];
        }
        const splits = message.text.split(' ');
        const cmds = [];
        let cmd = {};
        for (let i = 0; i < splits.length; i++) {
            if (splits[i].charAt(0) === '/') {
                if (cmd.cmd) {
                    cmds.push(cmd);
                }
                cmd = {
                    cmd: splits[i],
                    sender: message.from.username,
                    chatId: message.chat.id,
                    replyTo: message.reply_to_message_id,
                    messageId: message.message_id,
                    args: [],
                };
            } else {
                cmd.args = cmd.args || [];
                cmd.args.push(splits[i]);
            }
        }
        if (cmd.cmd) {
            cmds.push(cmd);
        }
        return cmds;
    },
    processUpdates: () => {
        try {
            getUpdates(OFFSET, (error, response, body) => {
                if (error) {
                    console.log(error);
                } else {
                    const jsonBody = JSON.parse(body);
                    jsonBody.result.forEach((i) => {
                        if (i.update_id > OFFSET) {
                            const cmds = module.exports.parseCommand(i.message);
                            cmds.forEach((c) => {
                                if(this.commandCallbacks[c.cmd]) {
                                    try {
                                        this.commandCallbacks[c.cmd](c);
                                    } catch (e) {
                                        module.exports.sendMessage(c.chatId, '오류가 있었어. ' + e.toString());
                                        console.log(e);
                                    }
                                }
                            });
                        }
                    });
                    OFFSET = jsonBody.result[jsonBody.result.length - 1].update_id;
                }
                setTimeout(module.exports.processUpdates, 2000);
            });  
        } catch (e) {
            console.log(e);
            setTimeout(module.exports.processUpdates, 2000);
        }
    },
}