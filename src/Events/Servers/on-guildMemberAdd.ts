import KetClient from "../../Main";

module.exports = class guildMemberAddEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async on() {
        return;
    }
}