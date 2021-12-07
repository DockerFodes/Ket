import Eris from "eris"

module.exports = class MessageUpdateEvent {
    ket: Eris.Client;
    constructor(ket: Eris.Client) {
        this.ket = ket;
    }
    async start(newMessage: Eris.Message, oldMessage: Eris.Message) {
        if (oldMessage.content !== newMessage.content) return this.ket.emit("messageCreate", newMessage);
    }
}