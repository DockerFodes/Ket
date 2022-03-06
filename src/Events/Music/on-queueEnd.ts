import { Player } from "erela.js";
import KetClient from "../../Main";

module.exports = class queueEndEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async on(player: Player) {
        this.ket.send({ ctx: player.textChannel, content: 'playlist finalizada' });
        return;
    }
}