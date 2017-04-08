const requestPromise = require('../request-promise');
const CONFIG = require('../config');

module.exports = {
    getUpdates: async(offset, allowed_updates = ['message']) => {
        const payload = JSON.stringify({
            offset: offset,
            allowed_updates: allowed_updates,
        });
        const options = {
            url: 'https://api.telegram.org/bot' + CONFIG.get('telegramToken') + '/getUpdates',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: payload,
        };
        return requestPromise(options);
    },

    sendMessage: async(payload) => {
        const options = {
            url: 'https://api.telegram.org/bot' + CONFIG.get('telegramToken') + '/sendMessage',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
        };
        return requestPromise(options);
    },
}