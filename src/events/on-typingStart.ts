import { Channel, Client, Member, User } from "eris"

module.exports = class RawRESTEvent {
    ket: Client;
    constructor(ket: Client) {
        this.ket = ket;
    }
    async start(channel: Channel, user: User, member: Member) {
        if(user.id === this.ket.user.id) {
            this.ket.user.tag
        }
    }
}