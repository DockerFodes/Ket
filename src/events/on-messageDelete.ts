import Eris from "eris"

module.exports = class MessageDeleteEvent {
    ket: Eris.Client;
    constructor(ket: Eris.Client) {
        this.ket = ket
    }
    async start(message: Eris.Message) {
        return;
    }
}