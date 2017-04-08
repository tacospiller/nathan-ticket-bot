const Telegram = require('./api-wrapper');
const Commands = require('./commands');

let OFFSET = 0;

function parseCommand(message) {
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
                args: [],
                message: message,
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
}

async function pollUpdates() {
    try {
        const [response, body] = await Telegram.getUpdates(OFFSET);
        const jsonBody = JSON.parse(body);

        jsonBody.result
            .filter((i) => {
                return i.update_id > OFFSET;
            })
            .forEach((r) => {
                const cmds = parseCommand(i.message);
                for (let i = 0; i < cmds.length; i++) {
                    Commands[cmds[i].cmd](cmds[i]);
                }
            });
            
        if (jsonbody.result.length > 0) {
            OFFSET = jsonBody.result[jsonBody.result.length - 1].update_id;
        }
    } catch (e) {
        console.log(e);
    }
    setTimeout(pollUpdates, 2000);
}

module.exports = async() => {
    try {
        const [response, body] = await Telegram.getUpdates(OFFSET);
        const jsonBody = JSON.parse(body);
        if (jsonBody.result.length > 0) {
            OFFSET = jsonBody.result[jsonBody.result.length - 1].update_id;
        }
    } catch (e) {
        console.log(e);
    }
    pollUpdates();
}   