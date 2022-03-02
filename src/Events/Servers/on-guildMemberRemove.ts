import KetClient from "../../Main";

module.exports = class guildMemberRemoveEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async on() {
        return;
    }
}