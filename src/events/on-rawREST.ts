import { RawRESTRequest } from "eris";
import KetClient from "../KetClient";
const moment = require('moment'),
    c = require('chalk');

module.exports = class RawRESTEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async start(req: RawRESTRequest) {
        if (req.resp.statusCode === 429) {
            let rl = this.ket.requestHandler.ratelimits[req.route],
                info = {
                    isGlobal: false,
                    method: req.method,
                    route: req.route,
                    limit: rl.limit,
                    reset: moment.duration(Date.now() - rl.reset).format(" dd[d] hh[h] mm[m] ss[s] S[ms]")
                };
            if (req.resp.headers['x-ratelimit-global'] || req.resp.headers['x-ratelimit-scope'] === 'global') info.isGlobal = true

            global.session.log('error', 'RATE LIMIT', `fudeu deu rate limit${info.isGlobal ? ' GLOBAL' : ''}:`, `Escopo: ${c.green(req.resp.headers['x-ratelimit-scope'])}\nLimite: ${c.green(info.limit)} requests para ${c.green(info.method)} on ${c.green(info.route)}\nreseta em: ${c.green(info.reset)}`)
        }
    }
}