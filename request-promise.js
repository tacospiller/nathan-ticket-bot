const request = require('request');

module.exports = async function(options) {
    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error) reject(error);
            else resolve(response, body);
        });
    });
};