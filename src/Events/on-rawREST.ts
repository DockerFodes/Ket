import KetClient from "../Main";
import { RawRESTRequest } from "eris";
import moment from 'moment';

module.exports = class RawRESTEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async on(req: RawRESTRequest) {
        if (req.resp.statusCode === 429 || req.resp.headers['x-ratelimit-scope']) {
            let rl = this.ket.requestHandler.ratelimits[req.route],
                timeout = moment.duration(Date.now() - rl.reset).format(" dd[d] hh[h] mm[m] ss[s] S[ms]");

            console.log(`${String(req.resp.headers['x-ratelimit-scope']).toUpperCase()} RATE LIMIT/${timeout}`, `${rl.limit} ${req.method}S em ${req.route}`)
        }
    }
}