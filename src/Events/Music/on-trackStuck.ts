import { Player } from "erela.js";
import KetClient from "../../Main";

module.exports = class Event {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async on(player: Player) {
        this.ket.send({ ctx: player.textChannel, content: 'xi deu merda viado'})
        return;
    }
}