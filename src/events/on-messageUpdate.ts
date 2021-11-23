module.exports = class MessageUpdate {
    ket:any
    constructor(ket) {
        this.ket = ket
    }
    async start(newMessage, oldMessage) {
        if(oldMessage !== newMessage) return this.ket.emit("messageCreate", newMessage)
    }
}