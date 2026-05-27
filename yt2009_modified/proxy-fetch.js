const fetch = require('node-fetch');
const { SocksProxyAgent } = require('socks-proxy-agent');
const proxyAgent = new SocksProxyAgent('socks5://127.0.0.1:40000');

module.exports = function (url, options) {
    if (!options) options = {};
    if (!options.agent) {
        options.agent = proxyAgent;
    }
    return fetch(url, options);
};
module.exports.Headers = fetch.Headers;
module.exports.Request = fetch.Request;
module.exports.Response = fetch.Response;
module.exports.FetchError = fetch.FetchError;
