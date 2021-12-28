import Eris from "eris";
const moment = require('moment'),
    c = require('chalk');

module.exports = class RawRESTEvent {
    ket: Eris.Client;
    constructor(ket: Eris.Client) {
        this.ket = ket;
    }
    async start(req) {
        if (req.resp.statusCode === 429) {
            let rl = this.ket.requestHandler.ratelimits[req.route],
                info = {
                    isGlobal: 'só Deus sabe ¯\\_(ツ)_/¯',
                    method: req.method,
                    route: req.route,
                    limit: rl.limit,
                    reset: moment.duration(Date.now() - rl.reset).format(" dd[d] hh[h] mm[m] ss[s] S[ms]")
                };
            if (req.resp.headers['x-ratelimit-global'] || req.resp.headers['x-ratelimit-scope'] === 'global') info.isGlobal = 'ss, tomou no cu'

            global.session.log('error', 'RATE LIMIT', `fudeu deu rate limit`, `     no escopo ${c.green(req.resp.headers['x-ratelimit-scope'])} por fazer ${c.yellow('(cofcof merda)')} um total de ${c.green(info.limit)} requests para ${c.green(info.method)} on ${c.green(info.route)}\n     reseta em: ${c.green(info.reset)}`)
        }
    }
}