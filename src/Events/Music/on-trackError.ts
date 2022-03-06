import { Player } from "erela.js";
import KetClient from "../../Main";

module.exports = class trackErrorEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async on(player: Player) {
        this.ket.send({ ctx: player.textChannel, content: `Houve um erro ao reproduzir essa música.` });
        console.log(`ERELA / ${player.node.options.identifier}`, 'Errorrrrr');
        return;
    }
}