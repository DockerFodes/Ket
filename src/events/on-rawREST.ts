import Eris from "eris"

module.exports = class RawRESTEvent {
    ket: Eris.Client;
    constructor(ket: Eris.Client) {
        this.ket = ket;
    }
    async start(req) {
        console.log(req.body)
    }
}