import { RawRESTRequest } from "eris";
import KetClient from "../../Main";
import moment from 'moment';

module.exports = class RawRESTEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async on(req: RawRESTRequest) {
        if (req.resp.statusCode !== 429 || !req.resp.headers['x-ratelimit-bucket']) return;

        let res = req.resp.headers,
            duration = moment.duration(Number(res['x-ratelimit-reset-after']) * 1000)
                .format(" dd[d] hh[h] mm[m] ss[s] S[ms]");

        let id = String((res['x-ratelimit-global'] ? 'GLOBAL ' : '') + res['x-ratelimit-scope']).toUpperCase()
        console.log(`${id} RATE LIMIT`,
            `${duration} por ${res['x-ratelimit-limit']} ${req.method}S em ${req.route}`,
            `(API response: ${req.resp.statusCode}/${req.resp.statusMessage})`, 31);

        return;
    }
}